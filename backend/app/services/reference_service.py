"""Real academic reference lookup.

Every paper returned here comes from a live index (Crossref or arXiv) and has a
resolvable URL. The LLM is deliberately not involved: asked to "list IEEE
references", a language model will confidently invent titles, authors and DOIs
that do not exist. Nothing in this module generates a citation.

Crossref needs no API key. It indexes IEEE, ACM and most journals, and returns
DOIs, authors and publication years for real records. arXiv covers preprints.
"""

import asyncio
import logging
import os
import re
import time
import urllib.parse
import xml.etree.ElementTree as ET
from typing import Any, Dict, List, Tuple

import httpx

logger = logging.getLogger("innoquest")

CROSSREF_WORKS = "https://api.crossref.org/works"
ARXIV_QUERY = "https://export.arxiv.org/api/query"
GITHUB_SEARCH = "https://api.github.com/search/repositories"
DEVTO_ARTICLES = "https://dev.to/api/articles"

# Crossref member id for IEEE. Filtering by member surfaces real IEEE
# conference papers instead of them being diluted across all publishers.
IEEE_MEMBER_ID = "263"

# Records that are not journal articles or conference papers add noise
# (books, datasets, posters, components).
CROSSREF_TYPE_FILTER = "type:journal-article,type:proceedings-article"

CROSSREF_TIMEOUT = 8.0
ARXIV_TIMEOUT = 8.0
GITHUB_TIMEOUT = 8.0
# Long enough that the window actually rolls over before the retry, but not so
# long that a normal analysis feels stalled.
GITHUB_RETRY_DELAY = 7.0
DEVTO_TIMEOUT = 8.0
MAX_AUTHORS_SHOWN = 3
MAX_REFERENCES = 8

# Per-category display caps. Papers are the citable evidence, GitHub projects are
# the most actionable thing a student can actually run, blogs are the weakest
# evidence but still useful for "how do I build this".
MAX_PAPERS = 5
MAX_PROJECTS = 4
MAX_BLOGS = 3

# dev.to's tag search is loose: a "healthtech" tag returns generic SaaS posts.
# Rather than trusting it, we keep a wider candidate pool and let MiniLM drop
# what is actually irrelevant.
DEVTO_CANDIDATE_POOL = 12

_TAGS = re.compile(r"<[^>]+>")

# GitHub's unauthenticated search API allows only 10 requests per minute, and
# this backend has no token by default. Caching each query for an hour means a
# nine-project backfill or a student re-opening the advisor costs almost
# nothing, instead of burning the quota on repeated identical searches.
_GITHUB_CACHE: Dict[str, Tuple[float, List[Dict[str, Any]]]] = {}
_GITHUB_CACHE_TTL = 3600.0

_STOPWORDS = {
    "a", "an", "the", "and", "or", "but", "is", "are", "was", "were",
    "be", "been", "being", "have", "has", "had", "do", "does", "did",
    "to", "from", "in", "on", "at", "for", "with", "without", "into",
    "our", "we", "they", "it", "its", "this", "that", "these", "those",
    "there", "their", "can", "will", "would", "should", "could", "may",
    "not", "no", "so", "than", "too", "very", "just", "also", "more",
    "most", "some", "such", "only", "over", "under", "about", "which",
    "who", "what", "when", "where", "how", "why", "all", "any", "as",
    "by", "if", "am", "up", "out", "off", "then", "once", "here",
}


def _meaningful_words(text: str) -> List[str]:
    clean = re.sub(r"[^\w\s-]", " ", (text or "").lower())
    return [w for w in clean.split() if w not in _STOPWORDS and len(w) > 2]


class ReferenceService:
    """Fetches verifiable academic references for a project idea."""

    # ---------------------------------------------------------------- query

    @classmethod
    def build_academic_query(cls, problem_statement: str, domain: str = "") -> str:
        """Builds a search string aimed at academic literature.

        OnlineSearchService.extract_search_keywords is tuned for GitHub and web
        search and keeps only five terms, which is too thin for paper search. We
        keep more meaningful words and append the student's stated domain, which
        is usually the highest-signal term they give us.
        """
        words = _meaningful_words(problem_statement)
        # Keep the tail: later words in a problem statement tend to hold the
        # technical specifics, while the opening is usually context.
        terms = words[-12:] if len(words) > 12 else words
        if domain:
            terms = terms + [d.strip() for d in re.split(r"[,/&+|]", domain) if d.strip()]
        return " ".join(terms).strip()

    @classmethod
    def build_repo_queries(cls, problem_statement: str, domain: str = "") -> List[str]:
        """Builds GitHub search queries.

        GitHub AND-matches every term against name + description + readme, so a
        prose clause such as "patients with intermittent cardiac arrhythmias"
        returns nothing. The student's declared technology domain is by far the
        strongest signal ("Cybersecurity & Cloud" -> wazuh, bunkerweb), so that
        leads; the problem nouns are a fallback for when the domain is generic.
        """
        queries: List[str] = []

        domain_words = _meaningful_words(domain)
        if domain_words:
            queries.append(" ".join(domain_words[:2]))
            if len(domain_words) > 2:
                queries.append(" ".join(domain_words[:3]))

        problem_words = _meaningful_words(problem_statement)
        if problem_words:
            queries.append(" ".join(problem_words[:3]))
            queries.append(" ".join(problem_words[-3:]))

        seen = set()
        unique = []
        for q in queries:
            key = q.lower()
            if q and key not in seen:
                seen.add(key)
                unique.append(q)
        return unique

    @classmethod
    def build_blog_tags(cls, problem_statement: str, domain: str = "") -> List[str]:
        """Picks dev.to tags to search.

        Only the domain is used. Feeding problem-statement words into a tag
        filter returns near-zero results, and dev.to has no free full-text
        search endpoint, so broad tags plus semantic filtering downstream is the
        only workable route.
        """
        tags = []
        for word in _meaningful_words(domain)[:3]:
            tag = re.sub(r"[^a-z0-9]", "", word.lower())
            if len(tag) >= 3:
                tags.append(tag)
        if not tags:
            # Short domains like "AI" produce no word of length >= 3, yet dev.to
            # does tag content as "ai". Fall back to the whole domain so the
            # category gets searched instead of being reported as broken.
            whole = re.sub(r"[^a-z0-9]", "", domain.lower())
            if len(whole) >= 2:
                tags.append(whole)
        return tags[:3]

    # ------------------------------------------------------------- normalise

    @classmethod
    def _format_authors(cls, authors: List[Dict[str, Any]]) -> List[str]:
        """Turns Crossref author objects into readable names, capped with et al."""
        names: List[str] = []
        for author in authors or []:
            if not isinstance(author, dict):
                continue
            given = (author.get("given") or "").strip()
            family = (author.get("family") or "").strip()
            if given and family:
                names.append(f"{given} {family}")
            elif family:
                names.append(family)
            elif given:
                names.append(given)
        if len(names) > MAX_AUTHORS_SHOWN:
            names = names[:MAX_AUTHORS_SHOWN] + ["et al."]
        return names

    @classmethod
    def _year_from(cls, date_parts: Any) -> int | None:
        try:
            return int(date_parts[0][0])
        except (TypeError, IndexError, ValueError):
            return None

    @classmethod
    def _normalise_crossref(cls, item: Dict[str, Any]) -> Dict[str, Any] | None:
        titles = item.get("title") or []
        title = (titles[0] if titles else "").strip()
        doi = (item.get("DOI") or "").strip()
        if not title or not doi:
            return None

        venues = item.get("container-title") or []
        venue = (venues[0] if venues else "").strip() or (item.get("publisher") or "").strip()

        snippet = _TAGS.sub(" ", item.get("abstract") or "")
        snippet = re.sub(r"\s+", " ", snippet).strip()

        return {
            "kind": "paper",
            "title": title,
            "authors": cls._format_authors(item.get("author") or []),
            "year": cls._year_from(item.get("issued", {}).get("date-parts")),
            "venue": venue,
            "doi": doi,
            # Prefer the DOI resolver over the publisher link: it is stable.
            "url": f"https://doi.org/{doi}",
            "source": "Crossref",
            "is_preprint": False,
            "abstract_snippet": snippet[:400] or None,
        }

    @classmethod
    def _normalise_arxiv(cls, entry: Any, ns: Dict[str, str]) -> Dict[str, Any] | None:
        title_elem = entry.find("atom:title", ns)
        id_elem = entry.find("atom:id", ns)
        title = (title_elem.text or "").strip() if title_elem is not None and title_elem.text else ""
        url = (id_elem.text or "").strip() if id_elem is not None and id_elem.text else ""
        if not title or not url:
            return None

        authors = []
        for author in entry.findall("atom:author", ns):
            name_elem = author.find("atom:name", ns)
            if name_elem is not None and name_elem.text:
                authors.append(name_elem.text.strip())
        shown = authors[:MAX_AUTHORS_SHOWN] + (["et al."] if len(authors) > MAX_AUTHORS_SHOWN else [])

        published = entry.find("atom:published", ns)
        year = None
        if published is not None and published.text:
            try:
                year = int(published.text.strip()[:4])
            except ValueError:
                year = None

        category = entry.find("arxiv:primary_category", ns)
        subject = category.get("term") if category is not None else None

        summary_elem = entry.find("atom:summary", ns)
        summary = (summary_elem.text or "").strip() if summary_elem is not None and summary_elem.text else ""

        return {
            "kind": "paper",
            "title": re.sub(r"\s+", " ", title),
            "authors": shown,
            "year": year,
            "venue": f"arXiv preprint{'' if not subject else f' ({subject})'}",
            "doi": None,
            "url": url,
            "source": "arXiv",
            # Labelled so preprints are not mistaken for peer-reviewed work.
            "is_preprint": True,
            "abstract_snippet": re.sub(r"\s+", " ", summary)[:400] or None,
        }

    @classmethod
    def _dedupe(cls, items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        seen: set = set()
        unique: List[Dict[str, Any]] = []
        for item in items:
            # Prefer the DOI when we have one, since titles vary in punctuation.
            key = item.get("doi") or item.get("url")
            if not key or key in seen:
                continue
            seen.add(key)
            unique.append(item)
        return unique

    # ---------------------------------------------------- similar projects

    @classmethod
    async def _github_query(
        cls, client: httpx.AsyncClient, query: str
    ) -> Tuple[List[Dict[str, Any]], bool]:
        cached = _GITHUB_CACHE.get(query)
        if cached and (time.time() - cached[0]) < _GITHUB_CACHE_TTL:
            return list(cached[1]), True

        params = {"q": query, "sort": "stars", "order": "desc", "per_page": "8"}
        headers = {
            "Accept": "application/vnd.github+json",
            # GitHub rejects requests without a User-Agent outright.
            "User-Agent": "Gamified-Student-Innovation-Platform/1.0",
        }
        token = (os.getenv("GITHUB_TOKEN") or "").strip()
        if token:
            # An optional token lifts the search limit from 10 to 30 per minute.
            headers["Authorization"] = f"Bearer {token}"

        try:
            resp = await client.get(GITHUB_SEARCH, params=params, headers=headers, timeout=GITHUB_TIMEOUT)
            if resp.status_code == 403:
                # Unauthenticated search allows 10 requests/minute. Three queries
                # per analysis can collide with a burst of clicks or with a
                # previous analysis still in flight, so back off and retry once
                # with the same headers rather than dropping the whole category.
                logger.warning("GitHub search quota hit for '%s'; retrying once", query)
                await asyncio.sleep(GITHUB_RETRY_DELAY)
                resp = await client.get(GITHUB_SEARCH, params=params, headers=headers, timeout=GITHUB_TIMEOUT)
            if resp.status_code != 200:
                # 403 that survived the retry is a genuine quota exhaustion or a
                # blocked token, 422 a malformed query. Neither is worth more.
                logger.warning("GitHub returned %s for query '%s'", resp.status_code, query)
                if resp.status_code == 403:
                    logger.warning(
                        "GitHub search quota exhausted (10/min unauthenticated). "
                        "Set GITHUB_TOKEN in .env to raise it to 30/min."
                    )
                return [], False
            out = []
            for item in resp.json().get("items", []):
                pushed = item.get("pushed_at") or ""
                out.append({
                    "kind": "project",
                    "title": item.get("full_name") or item.get("name") or "GitHub project",
                    "source_name": item.get("full_name") or "",
                    "description": (item.get("description") or "").strip() or None,
                    "url": item.get("html_url") or "",
                    "stars": item.get("stargazers_count") or 0,
                    "language": item.get("language"),
                    "topics": item.get("topics") or [],
                    "last_pushed": pushed[:10] if pushed else None,
                    "abstract_snippet": (item.get("description") or "").strip() or None,
                })
            _GITHUB_CACHE[query] = (time.time(), out)
            return out, True
        except Exception as exc:
            logger.warning("GitHub request failed: %s", exc)
            return [], False

    @classmethod
    async def fetch_projects(
        cls, problem_statement: str, domain: str = ""
    ) -> Tuple[List[Dict[str, Any]], str]:
        """Returns (github_projects, status).

        Every query variant is merged rather than taking whichever returned the
        most rows. A broad domain query like "full stack application" happily
        returns netdata and sst because they are popular, which drowns out the
        narrower problem-word query that actually matches. Merging and letting
        MiniLM rank keeps both and puts the relevant ones first.
        """
        queries = cls.build_repo_queries(problem_statement, domain)
        if not queries:
            return [], "failed"

        logger.info("Searching GitHub for similar projects: %s", queries)
        merged: List[Dict[str, Any]] = []
        seen: set = set()
        succeeded = False
        try:
            async with httpx.AsyncClient(follow_redirects=True) as client:
                for query in queries[:3]:
                    items, ok = await cls._github_query(client, query)
                    succeeded = succeeded or ok
                    for item in items:
                        url = item.get("url")
                        if not url or url in seen:
                            continue
                        seen.add(url)
                        item["matched_query"] = query
                        merged.append(item)
                    # Spend the scarce quota wisely: a well-populated domain
                    # query is enough, so only fall through when it is thin.
                    if len(merged) >= 6:
                        break
        except Exception as exc:
            logger.warning("GitHub lookup failed entirely: %s", exc)
            return [], "failed"

        if not merged:
            return [], "success" if succeeded else "failed"
        return merged, "success"

    # ---------------------------------------------------------------- blogs

    @classmethod
    async def _devto_query(
        cls, client: httpx.AsyncClient, tag: str
    ) -> Tuple[List[Dict[str, Any]], bool]:
        try:
            resp = await client.get(
                DEVTO_ARTICLES,
                params={"tag": tag, "per_page": str(DEVTO_CANDIDATE_POOL)},
                headers={"User-Agent": "Gamified-Student-Innovation-Platform/1.0"},
                timeout=DEVTO_TIMEOUT,
            )
            if resp.status_code != 200:
                logger.warning("dev.to returned %s for tag '%s'", resp.status_code, tag)
                return [], False
            out = []
            for art in resp.json() or []:
                out.append({
                    "kind": "article",
                    "title": art.get("title") or "Article",
                    "source_name": ((art.get("user") or {}).get("name")) or "dev.to",
                    "description": (art.get("description") or "").strip() or None,
                    "url": art.get("url") or "",
                    "reading_time_min": art.get("reading_time_min"),
                    "reactions": art.get("public_reactions_count") or 0,
                    "published": (art.get("published_at") or "")[:10] or None,
                    "tags": art.get("tag_list") or [],
                    "abstract_snippet": (art.get("description") or "").strip() or None,
                })
            return out, True
        except Exception as exc:
            logger.warning("dev.to request failed: %s", exc)
            return [], False

    @classmethod
    async def fetch_blogs(
        cls, problem_statement: str, domain: str = ""
    ) -> Tuple[List[Dict[str, Any]], str]:
        """Returns (blog_articles, status). Unfiltered: dev.to tag search is
        loose, so relevance filtering happens in the router via MiniLM."""
        tags = cls.build_blog_tags(problem_statement, domain)
        if not tags:
            return [], "failed"

        logger.info("Searching dev.to for related articles: %s", tags)
        try:
            async with httpx.AsyncClient(follow_redirects=True) as client:
                results = await asyncio.gather(
                    *(cls._devto_query(client, t) for t in tags),
                    return_exceptions=True,
                )
        except Exception as exc:
            logger.warning("dev.to lookup failed entirely: %s", exc)
            return [], "failed"

        items: List[Dict[str, Any]] = []
        seen: set = set()
        ok = False
        for result in results:
            if isinstance(result, BaseException):
                logger.warning("dev.to source raised: %s", result)
                continue
            got, succeeded = result
            ok = ok or succeeded
            for art in got:
                # dev.to returns the same article under several tags, so the
                # tag fan-out duplicates entries without this.
                url = art.get("url")
                if not url or url in seen:
                    continue
                seen.add(url)
                items.append(art)

        if not items:
            return [], "success" if ok else "failed"
        return items[:DEVTO_CANDIDATE_POOL * 2], "success"

    # --------------------------------------------------------------- fetching

    @classmethod
    async def _crossref_query(
        cls, client: httpx.AsyncClient, query: str, rows: int, extra_filter: str = ""
    ) -> Tuple[List[Dict[str, Any]], bool]:
        """Returns (items, succeeded). succeeded=False means the request itself
        failed, which must be reported as partial rather than silently treated
        as "no results"."""
        filters = [CROSSREF_TYPE_FILTER]
        if extra_filter:
            filters.append(extra_filter)
        params = {
            "query.bibliographic": query,
            "rows": str(rows),
            "filter": ",".join(filters),
            "select": "DOI,title,author,issued,container-title,publisher,type,abstract",
        }
        mailto = (os.getenv("CROSSREF_MAILTO") or "").strip()
        if mailto:
            # Crossref's "polite pool" (identified by a mailto) has far higher
            # rate limits than the default pool.
            params["mailto"] = mailto

        url = f"{CROSSREF_WORKS}?{urllib.parse.urlencode(params)}"
        # Hoisted so the 429 retry below sends the same identification as the
        # first attempt: dropping it would make the retry the most anonymous
        # request in the burst, i.e. the one most likely to be throttled again.
        headers = {"User-Agent": f"InnoQuest/1.0 (mailto:{mailto})" if mailto else "InnoQuest/1.0"}
        try:
            resp = await client.get(url, headers=headers, timeout=CROSSREF_TIMEOUT)
            if resp.status_code != 200:
                if resp.status_code == 429:
                    # Back off briefly rather than dropping the category: the
                    # polite pool (CROSSREF_MAILTO) avoids this entirely.
                    logger.warning("Crossref rate-limited query '%s'; retrying once", query)
                    await asyncio.sleep(2.0)
                    resp = await client.get(url, headers=headers, timeout=CROSSREF_TIMEOUT)
                if resp.status_code != 200:
                    logger.warning(
                        "Crossref returned %s for query '%s'%s",
                        resp.status_code, query,
                        " (set CROSSREF_MAILTO to use the polite pool)" if resp.status_code == 429 else "",
                    )
                    return [], False
            payload = resp.json()
            items = payload.get("message", {}).get("items", []) or []
            return [n for n in (cls._normalise_crossref(i) for i in items) if n], True
        except Exception as exc:
            logger.warning("Crossref request failed: %s", exc)
            return [], False

    @classmethod
    async def _arxiv_query(cls, client: httpx.AsyncClient, query: str) -> Tuple[List[Dict[str, Any]], bool]:
        params = {
            "search_query": f"all:{query}",
            "start": "0",
            "max_results": "10",
            # Newest first is a poor default here; relevance is what we want.
            "sortBy": "relevance",
            "sortOrder": "descending",
        }
        url = f"{ARXIV_QUERY}?{urllib.parse.urlencode(params)}"
        try:
            resp = await client.get(url, timeout=ARXIV_TIMEOUT)
            if resp.status_code != 200:
                logger.warning("arXiv returned %s for query '%s'", resp.status_code, query)
                return [], False
            root = ET.fromstring(resp.text)
            ns = {
                "atom": "http://www.w3.org/2005/Atom",
                "arxiv": "http://arxiv.org/schemas/atom",
            }
            return [n for n in (cls._normalise_arxiv(e, ns) for e in root.findall("atom:entry", ns)) if n], True
        except Exception as exc:
            logger.warning("arXiv request failed: %s", exc)
            return [], False

    @classmethod
    async def fetch_references(
        cls, problem_statement: str, domain: str = ""
    ) -> Tuple[List[Dict[str, Any]], str]:
        """Returns (references, status).

        status is one of:
          success  - at least one paper found
          partial  - one index failed, the other returned results
          failed   - every index failed or returned nothing
        Never raises, and never returns a fabricated entry.
        """
        query = cls.build_academic_query(problem_statement, domain)
        if not query:
            logger.info("No usable search terms in the problem statement; skipping references.")
            return [], "failed"

        logger.info("Fetching academic references for query: '%s'", query)
        try:
            async with httpx.AsyncClient(follow_redirects=True) as client:
                # Crossref rate-limits bursts, so the IEEE-specific query is
                # staggered rather than fired at the same instant.
                ieee_task = asyncio.create_task(
                    cls._crossref_after(client, query, rows=6, extra_filter=f"member:{IEEE_MEMBER_ID}")
                )
                broad, arxiv = await asyncio.gather(
                    cls._crossref_query(client, query, rows=10),
                    cls._arxiv_query(client, query),
                    return_exceptions=True,
                )
                ieee = await ieee_task
        except Exception as exc:
            logger.warning("Reference lookup failed entirely: %s", exc)
            return [], "failed"

        def _unpack(value: Any) -> Tuple[List[Dict[str, Any]], bool]:
            """A source either raised or reported its own success flag. Either
            way we need (items, succeeded) and must not lose the failure."""
            if isinstance(value, BaseException):
                logger.warning("Reference source raised: %s", value)
                return [], False
            items, succeeded = value
            return list(items or []), bool(succeeded)

        broad_list, broad_ok = _unpack(broad)
        ieee_list, ieee_ok = _unpack(ieee)
        arxiv_list, arxiv_ok = _unpack(arxiv)

        failed = [name for name, ok in
                  (("crossref", broad_ok), ("crossref-ieee", ieee_ok), ("arxiv", arxiv_ok))
                  if not ok]

        # Crossref broad first, then IEEE, then preprints. Dedupe keeps the
        # earliest occurrence, so this also controls priority.
        merged = cls._dedupe([*broad_list, *ieee_list, *arxiv_list])

        if not merged:
            return [], "failed"
        if failed:
            logger.info("Reference lookup partial; source(s) unavailable: %s", ", ".join(failed))
            return merged[: MAX_REFERENCES * 2], "partial"
        return merged[: MAX_REFERENCES * 2], "success"

    @classmethod
    async def _crossref_after(
        cls, client: httpx.AsyncClient, query: str, rows: int, extra_filter: str = "", delay: float = 1.2
    ) -> Tuple[List[Dict[str, Any]], bool]:
        await asyncio.sleep(delay)
        return await cls._crossref_query(client, query, rows=rows, extra_filter=extra_filter)

    @classmethod
    def rank_by_relevance(
        cls,
        references: List[Dict[str, Any]],
        student_problem: str,
        embedder: Any = None,
        limit: int = MAX_REFERENCES,
        min_relevance: float | None = None,
    ) -> List[Dict[str, Any]]:
        """Orders references by MiniLM similarity when available.

        Papers are only reordered, never filtered: the user explicitly asked for
        references, so an imperfect match is still a real paper worth reading.
        Blogs pass `min_relevance` instead, because dev.to's tag search returns
        plenty of posts that have nothing to do with the project.

        Every returned item always carries `relevance_score` /
        `relevance_percentage`, set to None when nothing could be measured. A
        missing key would crash the UI, and a 0.0 would read as "measured, no
        match" rather than "not measured".
        """
        if not references:
            return []

        unmeasured = [
            {**ref, "relevance_score": None, "relevance_percentage": None}
            for ref in references[:limit]
        ]

        if embedder is None or not getattr(embedder, "is_available", lambda: False)():
            return unmeasured

        try:
            student_emb = embedder.get_embedding(f"Problem: {student_problem}")
        except Exception as exc:
            logger.warning("Could not embed the problem statement: %s", exc)
            return unmeasured

        def _text(ref: Dict[str, Any]) -> str:
            # GitHub repos and blog posts have no venue or year, so the context
            # line is built from whatever that kind actually carries.
            kind = ref.get("kind")
            if kind == "project":
                context = " ".join(
                    filter(None, [
                        ref.get("language"),
                        " ".join(ref.get("topics") or []),
                        ref.get("source_name"),
                    ])
                )
            elif kind == "article":
                context = " ".join(filter(None, [
                    " ".join(ref.get("tags") or []),
                    ref.get("source_name"),
                ]))
            else:
                context = ref.get("venue") or ""
            return (
                f"Title: {ref.get('title', '')}\n"
                f"Problem: {ref.get('abstract_snippet') or ''}\n"
                f"Context: {context}"
            )

        scored: List[Dict[str, Any]] = []
        for ref in references:
            try:
                ref_emb = embedder.get_embedding(_text(ref))
                sim = max(0.0, round(embedder.calculate_cosine_similarity(student_emb, ref_emb), 4))
                scored.append(
                    {**ref, "relevance_score": sim, "relevance_percentage": round(sim * 100, 1)}
                )
            except Exception:
                scored.append({**ref, "relevance_score": None, "relevance_percentage": None})

        # Measured entries sort above unmeasured ones, then by score.
        scored.sort(
            key=lambda r: (r.get("relevance_score") is not None, r.get("relevance_score") or 0.0),
            reverse=True,
        )
        if min_relevance is not None:
            # Keep unmeasured entries rather than discarding a category outright:
            # no score means "unknown", not "irrelevant".
            scored = [r for r in scored if r.get("relevance_score") is None
                      or r["relevance_score"] >= min_relevance]
        return scored[:limit]
    # ----------------------------------------------------------- orchestration

    @staticmethod
    def _on_topic(item: Dict[str, Any], domain: str, problem_statement: str) -> bool:
        """Cheap literal check that a title is actually in the subject area.

        Embedding similarity alone lets clear mismatches through: "What Saba
        Saba 2026 Reveals" scores ~0.31 against an unrelated problem because
        short titles share generic sentence structure. Requiring one literal
        term in common with the domain or the problem statement catches those,
        and it does so without another model call.

        Matching is containment-based rather than exact because the two sides
        rarely use identical vocabulary: a domain of "Cybersecurity & Cloud"
        has to count as a hit for a repo tagged "security". The 5-character
        minimum keeps short tokens like "ai" or "iot" from matching everything.

        Deliberately not applied to papers: academic titles legitimately use
        different vocabulary from the student's problem statement, and their DOI
        plus venue already establish provenance.
        """
        target = set(_meaningful_words(domain)) | set(_meaningful_words(problem_statement))
        if not target:
            return True  # nothing to compare against; defer to the embedding
        text = set(
            _meaningful_words(
                " ".join(
                    str(item.get(k) or "")
                    for k in ("title", "source_name", "description", "abstract_snippet", "topics", "tags")
                )
            )
        )
        for word in text:
            if len(word) < 5:
                continue
            for candidate in target:
                if len(candidate) >= 5 and (word in candidate or candidate in word):
                    return True
        return False

    @staticmethod
    def _dedupe_near_duplicates(
        items: List[Dict[str, Any]], threshold: float = 0.70
    ) -> List[Dict[str, Any]]:
        """Collapses items that are the same piece of work under a reworded title.

        GitHub and dev.to both return near-copies: the same repo once as
        `optimizing--user--group` and once as `optimizing_user_group`, and the
        same blog post as "A Practical Guide to Web Application Scalability" and
        "Web Application Scalability: A Practical Guide". Exact URL matching
        misses both.

        Items arrive already ranked, so the first (best-scoring) one wins and
        the later copy is dropped.
        """
        kept: List[Dict[str, Any]] = []
        kept_tokens: List[set] = []
        for item in items:
            # Stricter normalisation than _meaningful_words: every non-alphanumeric
            # run collapses, so "Optimizing--User--Group" and "Optimizing_User_Group"
            # produce the same token set instead of being treated as different names.
            tokens = {
                w
                for w in re.sub(r"[^a-z0-9]+", " ", str(item.get("title") or "").lower()).split()
                if len(w) > 2 and w not in _STOPWORDS
            }
            if not tokens:
                kept.append(item)
                kept_tokens.append(tokens)
                continue
            duplicate = False
            for seen in kept_tokens:
                if not seen:
                    continue
                overlap = len(tokens & seen) / len(tokens | seen)
                if overlap >= threshold:
                    duplicate = True
                    break
            if not duplicate:
                kept.append(item)
                kept_tokens.append(tokens)
        return kept

    @classmethod
    async def fetch_all(
        cls,
        problem_statement: str,
        domain: str = "",
        embedder: Any = None,
    ) -> Dict[str, Any]:
        """Builds the three-category reference block stored in analysis_data.

        Papers come first because they are the only category that counts as
        evidence in a write-up. GitHub projects come next because they are the
        most actionable thing a student can actually run. Blogs come last: they
        are useful for implementation detail but the weakest citation of the
        three, so the UI presents them as such.
        """
        papers, projects, articles = await asyncio.gather(
            cls.fetch_references(problem_statement, domain),
            cls.fetch_projects(problem_statement, domain),
            cls.fetch_blogs(problem_statement, domain),
            return_exceptions=True,
        )

        def _pair(value: Any, default: Tuple[Any, str]) -> Tuple[Any, str]:
            if isinstance(value, BaseException):
                logger.warning("Reference category raised: %s", value)
                return default
            return value

        raw_papers, paper_status = _pair(papers, ([], "failed"))
        raw_projects, project_status = _pair(projects, ([], "failed"))
        raw_articles, article_status = _pair(articles, ([], "failed"))

        def _gate(items: Any) -> List[Dict[str, Any]]:
            """Drops off-topic items, but never empties a section that had hits.

            Returning nothing is worse than returning something imperfect: the
            empty state tells the student the lookup failed when it in fact
            worked. The relevance floor still applies on top of this.
            """
            if not isinstance(items, list) or not items:
                return []
            kept = [i for i in items if cls._on_topic(i, domain, problem_statement)]
            return kept or list(items)

        ranked_papers = cls.rank_by_relevance(
            list(raw_papers), problem_statement, embedder=embedder, limit=MAX_PAPERS
        )
        # Projects also get a floor. GitHub sorts by stars, so a vague domain
        # like "full stack application" surfaces netdata (80k stars) and sst,
        # which are popular but have nothing to do with the student's problem.
        # Gating runs before ranking so a removed item does not consume a slot.
        ranked_projects = cls.rank_by_relevance(
            _gate(raw_projects), problem_statement, embedder=embedder,
            limit=MAX_PROJECTS, min_relevance=0.28,
        )
        # Blogs get a relevance floor because dev.to tag search is noisy.
        ranked_articles = cls.rank_by_relevance(
            _gate(raw_articles), problem_statement, embedder=embedder,
            limit=MAX_BLOGS, min_relevance=0.30,
        )

        # Applied last so it collapses copies without disturbing ranking, and
        # after the caps so a duplicate cannot occupy a slot.
        ranked_papers = cls._dedupe_near_duplicates(ranked_papers)
        ranked_projects = cls._dedupe_near_duplicates(ranked_projects)
        ranked_articles = cls._dedupe_near_duplicates(ranked_articles)

        logger.info(
            "References: %d paper(s)/%s, %d project(s)/%s, %d article(s)/%s",
            len(ranked_papers), paper_status,
            len(ranked_projects), project_status,
            len(ranked_articles), article_status,
        )
        return {
            "papers": {"items": ranked_papers, "count": len(ranked_papers), "status": paper_status},
            "projects": {"items": ranked_projects, "count": len(ranked_projects), "status": project_status},
            "articles": {"items": ranked_articles, "count": len(ranked_articles), "status": article_status},
            "total": len(ranked_papers) + len(ranked_projects) + len(ranked_articles),
            # Kept for the existing summary block so older UI code keeps working.
            "items": ranked_papers,
            "count": len(ranked_papers),
            "status": paper_status,
            "ieee_count": sum(1 for r in ranked_papers if (r.get("doi") or "").startswith("10.1109")),
            "preprint_count": sum(1 for r in ranked_papers if r.get("is_preprint")),
        }
