import asyncio
import logging
import re
import urllib.parse
import xml.etree.ElementTree as ET
from typing import Any, Dict, List
import httpx

logger = logging.getLogger("innoquest")

# Minimum similarity threshold configuration
MIN_SIMILARITY_THRESHOLD = 0.35

class OnlineSearchService:

    @classmethod
    def extract_search_keywords(cls, problem_statement: str) -> str:
        """Extracts clean, meaningful domain terms from student's problem statement for search queries."""
        if not problem_statement:
            return "innovation project"

        # Clean noise characters
        clean_text = re.sub(r'[^\w\s]', ' ', problem_statement.lower())
        words = clean_text.split()

        # Stopwords to filter out
        stopwords = {
            "a", "an", "the", "and", "or", "but", "is", "are", "was", "were", "be", "been", "being",
            "have", "has", "had", "do", "does", "did", "to", "from", "in", "out", "on", "off", "over",
            "under", "again", "further", "then", "once", "here", "there", "when", "where", "why", "how",
            "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor",
            "not", "only", "own", "same", "so", "than", "too", "very", "s", "t", "can", "will", "just",
            "don", "should", "now", "it", "its", "make", "making", "difficult", "users", "user", "problem",
            "solution", "system", "rapidly", "spread", "spreading", "distinguish", "reliable"
        }

        keywords = [w for w in words if w not in stopwords and len(w) > 2]
        if not keywords:
            # Fallback to first few words
            keywords = words[:5]

        # Limit to top 5 key search terms
        search_query = " ".join(keywords[:5])
        return search_query or problem_statement[:50]

    @classmethod
    async def search_github_repositories(cls, client: httpx.AsyncClient, query: str) -> List[Dict[str, Any]]:
        """Searches GitHub REST API for open-source project candidates."""
        results = []
        try:
            url = f"https://api.github.com/search/repositories?q={urllib.parse.quote(query)}&sort=stars&order=desc&per_page=10"
            headers = {"User-Agent": "Gamified-Student-Innovation-Platform/1.0"}
            resp = await client.get(url, headers=headers, timeout=6.0)
            if resp.status_code == 200:
                data = resp.json()
                items = data.get("items", [])
                for item in items:
                    desc = item.get("description") or item.get("name") or ""
                    results.append({
                        "title": item.get("name", "GitHub Project").replace("-", " ").title(),
                        "problem": f"Problem area related to {query}: {desc}",
                        "description": desc,
                        "source_type": "GitHub",
                        "source_name": item.get("full_name") or "GitHub Repository",
                        "source_url": item.get("html_url")
                    })
        except Exception as e:
            logger.warning(f"GitHub search request failed: {e}")
        return results

    @classmethod
    async def search_arxiv_papers(cls, client: httpx.AsyncClient, query: str) -> List[Dict[str, Any]]:
        """Searches arXiv REST API for research paper candidates."""
        results = []
        try:
            url = f"http://export.arxiv.org/api/query?search_query=all:{urllib.parse.quote(query)}&start=0&max_results=10"
            resp = await client.get(url, timeout=6.0)
            if resp.status_code == 200:
                root = ET.fromstring(resp.text)
                ns = {'atom': 'http://www.w3.org/2005/Atom'}
                for entry in root.findall('atom:entry', ns):
                    title_elem = entry.find('atom:title', ns)
                    summary_elem = entry.find('atom:summary', ns)
                    id_elem = entry.find('atom:id', ns)

                    title = title_elem.text.strip().replace("\n", " ") if title_elem is not None and title_elem.text else "Research Paper"
                    summary = summary_elem.text.strip().replace("\n", " ") if summary_elem is not None and summary_elem.text else ""
                    paper_url = id_elem.text.strip() if id_elem is not None and id_elem.text else ""

                    if title and paper_url:
                        results.append({
                            "title": title,
                            "problem": f"Academic research addressing: {summary[:200]}...",
                            "description": summary[:300] + ("..." if len(summary) > 300 else ""),
                            "source_type": "Research Paper",
                            "source_name": "arXiv",
                            "source_url": paper_url
                        })
        except Exception as e:
            logger.warning(f"arXiv search request failed: {e}")
        return results

    @classmethod
    async def search_web_solutions(cls, client: httpx.AsyncClient, query: str) -> List[Dict[str, Any]]:
        """Searches web API / DuckDuckGo for product, open source, and website candidates."""
        results = []
        try:
            url = f"https://api.duckduckgo.com/?q={urllib.parse.quote(query)}&format=json&no_html=1&skip_disambig=1"
            resp = await client.get(url, timeout=5.0)
            if resp.status_code == 200:
                data = resp.json()
                
                # Abstract result
                abs_title = data.get("Heading")
                abs_url = data.get("AbstractURL")
                abs_text = data.get("AbstractText")
                if abs_title and abs_url and abs_text:
                    results.append({
                        "title": abs_title,
                        "problem": f"Public solution related to {query}.",
                        "description": abs_text,
                        "source_type": "Open Source" if "github" in abs_url else "Website",
                        "source_name": data.get("AbstractSource") or "Public Solution",
                        "source_url": abs_url
                    })

                # Related topics
                related = data.get("RelatedTopics", [])
                for topic in related[:5]:
                    t_url = topic.get("FirstURL")
                    t_text = topic.get("Text")
                    if t_url and t_text:
                        parts = t_text.split(" - ", 1)
                        t_title = parts[0] if len(parts) > 1 else t_text[:40]
                        t_desc = parts[1] if len(parts) > 1 else t_text
                        results.append({
                            "title": t_title,
                            "problem": f"Addressing {query}",
                            "description": t_desc,
                            "source_type": "Product" if "product" in t_text.lower() else "Website",
                            "source_name": "Web Source",
                            "source_url": t_url
                        })
        except Exception as e:
            logger.warning(f"Web search request failed: {e}")
        return results

    @classmethod
    async def search_candidate_sources(cls, problem_statement: str) -> List[Dict[str, Any]]:
        """
        Dynamically searches online sources (GitHub, arXiv, Web) for existing solutions
        addressing a problem similar to the student's problem statement.
        """
        keywords = cls.extract_search_keywords(problem_statement)
        logger.info(f"Searching online sources for problem keywords: '{keywords}'...")

        async with httpx.AsyncClient(headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}, follow_redirects=True) as client:
            github_task = cls.search_github_repositories(client, keywords)
            arxiv_task = cls.search_arxiv_papers(client, keywords)
            web_task = cls.search_web_solutions(client, keywords)

            github_results, arxiv_results, web_results = await asyncio.gather(
                github_task, arxiv_task, web_task, return_exceptions=True
            )

        all_candidates = []
        if isinstance(github_results, list):
            all_candidates.extend(github_results)
        if isinstance(arxiv_results, list):
            all_candidates.extend(arxiv_results)
        if isinstance(web_results, list):
            all_candidates.extend(web_results)

        # Deduplicate candidates by source_url and title
        seen_urls = set()
        seen_titles = set()
        unique_candidates = []

        for candidate in all_candidates:
            url = candidate.get("source_url")
            title = candidate.get("title", "").strip().lower()

            if not url or not url.startswith("http"):
                continue
            if url in seen_urls or title in seen_titles:
                continue

            seen_urls.add(url)
            seen_titles.add(title)
            unique_candidates.append(candidate)

        logger.info(f"Retrieved {len(unique_candidates)} unique online candidates for problem statement.")
        return unique_candidates
