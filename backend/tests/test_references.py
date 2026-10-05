"""Tests for real academic reference retrieval and normalization.

No network: `fetch_references` is either stubbed or exercised through the
parsers with fixture payloads that mirror real Crossref/arXiv responses.
"""

import pytest

from app.services.reference_service import (
    IEEE_MEMBER_ID,
    MAX_AUTHORS_SHOWN,
    ReferenceService,
)

# conftest's autouse fixture swaps these for canned data so the default suite
# never touches the network. These tests want the real code with its HTTP layer
# monkeypatched instead, so the originals are captured at import time (during
# collection, before any fixture runs).
_REAL_FETCH_REFERENCES = ReferenceService.fetch_references


# --------------------------------------------------------------- query build


def test_build_academic_query_drops_stopwords_and_appends_domain():
    query = ReferenceService.build_academic_query(
        "The students are building a system for the community",
        "IoT, Machine Learning",
    )
    assert "the" not in query.split()
    assert "students" in query
    assert "IoT" in query and "Machine Learning" in query


def test_build_academic_query_empty_input_is_empty():
    assert ReferenceService.build_academic_query("", "") == ""


def test_build_academic_query_only_stopwords_is_empty():
    assert ReferenceService.build_academic_query("the and of a an", "") == ""


# ------------------------------------------------------------- crossref parse


def test_normalise_crossref_builds_doi_url_and_metadata():
    item = {
        "DOI": "10.1109/wf-iot48130.2020.9221251",
        "title": ["An IoT Based Efficient Waste Collection System with Smart Bins"],
        "author": [
            {"given": "Rifat", "family": "Zabin"},
            {"given": "Kumar", "family": "Yelamarthi"},
        ],
        "issued": {"date-parts": [[2020, 9, 1]]},
        "container-title": ["2020 IEEE 6th World Forum on Internet of Things (WF-IoT)"],
        "publisher": "IEEE",
        "abstract": "<jats:p>We present a smart bin.</jats:p>",
    }
    ref = ReferenceService._normalise_crossref(item)

    assert ref["url"] == "https://doi.org/10.1109/wf-iot48130.2020.9221251"
    assert ref["year"] == 2020
    assert ref["authors"] == ["Rifat Zabin", "Kumar Yelamarthi"]
    assert ref["is_preprint"] is False
    assert ref["source"] == "Crossref"
    # JATS markup from Crossref abstracts must not leak into the UI.
    assert "<jats:p>" not in ref["abstract_snippet"]
    assert ref["abstract_snippet"] == "We present a smart bin."


def test_normalise_crossref_truncates_authors_with_et_al():
    item = {
        "DOI": "10.1109/x",
        "title": ["Paper"],
        "author": [{"given": f"A{ i }", "family": f"Surname{i}"} for i in range(MAX_AUTHORS_SHOWN + 4)],
        "issued": {"date-parts": [[2021]]},
    }
    ref = ReferenceService._normalise_crossref(item)
    assert ref["authors"][-1] == "et al."
    assert len(ref["authors"]) == MAX_AUTHORS_SHOWN + 1


def test_normalise_crossref_requires_title_and_doi():
    # No reference may exist without something a reader can resolve.
    assert ReferenceService._normalise_crossref({"title": ["No DOI"]}) is None
    assert ReferenceService._normalise_crossref({"DOI": "10.1109/x"}) is None


def test_normalise_crossref_handles_missing_optional_fields():
    ref = ReferenceService._normalise_crossref(
        {"DOI": "10.1109/y", "title": ["Minimal paper"], "issued": {}}
    )
    assert ref["authors"] == []
    assert ref["year"] is None
    assert ref["venue"] == ""
    assert ref["abstract_snippet"] is None


def test_ieee_member_id_is_ieee():
    # Guards the hardcoded Crossref filter against an accidental edit.
    assert IEEE_MEMBER_ID == "263"


# ---------------------------------------------------------------- arxiv parse


ARXIV_FEED = """<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom"
      xmlns:arxiv="http://arxiv.org/schemas/atom">
  <entry>
    <id>http://arxiv.org/abs/2201.01234v1</id>
    <published>2022-01-03T18:00:00Z</published>
    <title>Dynamic Waste Collection Model for Smart Bins</title>
    <summary>  Predictive scheduling
    for collection.  </summary>
    <author><name>Asmit Roy Burman</name></author>
    <author><name>Urusha Goswami</name></author>
    <author><name>Hitesh Sharma</name></author>
    <author><name>Fourth Author</name></author>
    <arxiv:primary_category term="cs.CY"/>
  </entry>
</feed>
"""


def test_normalise_arxiv_parses_authors_year_category():
    import xml.etree.ElementTree as ET

    root = ET.fromstring(ARXIV_FEED)
    ns = {
        "atom": "http://www.w3.org/2005/Atom",
        "arxiv": "http://arxiv.org/schemas/atom",
    }
    ref = ReferenceService._normalise_arxiv(root.find("atom:entry", ns), ns)

    assert ref["year"] == 2022
    assert ref["is_preprint"] is True, "preprints must be labelled as such"
    assert ref["doi"] is None
    assert "cs.CY" in ref["venue"]
    assert ref["authors"][:3] == ["Asmit Roy Burman", "Urusha Goswami", "Hitesh Sharma"]
    assert ref["authors"][-1] == "et al."
    assert "Predictive scheduling" in ref["abstract_snippet"]
    assert ref["url"].startswith("http://arxiv.org/abs/")


# ------------------------------------------------------------------- dedupe


def test_dedupe_prefers_first_occurrence():
    items = [
        {"doi": "10.1109/a", "url": "u1", "title": "First"},
        {"doi": "10.1109/a", "url": "u1", "title": "Duplicate"},
        {"url": "https://arxiv.org/abs/1", "doi": None, "title": "arXiv one"},
        {"url": "https://arxiv.org/abs/1", "doi": None, "title": "arXiv dupe"},
    ]
    unique = ReferenceService._dedupe(items)
    assert [i["title"] for i in unique] == ["First", "arXiv one"]


# ------------------------------------------------------------------- ranking


def test_rank_by_relevance_orders_descending_and_caps():
    import re

    items = [
        {"title": f"Paper {i}", "doi": f"10.1109/{i}", "url": f"u{i}"} for i in range(20)
    ]

    class FakeEmbedder:
        """Scores each reference by how close its index is to the student's."""

        def is_available(self):
            return True

        def get_embedding(self, text):
            match = re.search(r"Paper (\d+)", text)
            return [float(match.group(1))] if match else [0.0]

        def calculate_cosine_similarity(self, a, b):
            return 1.0 - abs(a[0] - b[0]) / 20.0

    ranked = ReferenceService.rank_by_relevance(items, "Paper 19", embedder=FakeEmbedder())
    assert len(ranked) == 8
    scores = [r["relevance_score"] for r in ranked]
    assert scores == sorted(scores, reverse=True)
    # The closest paper ranks first even though 12 others score lower: we order
    # rather than filter, because the user explicitly asked for references.
    assert ranked[0]["title"] == "Paper 19"
    assert ranked[0]["relevance_percentage"] == 100.0


def test_rank_by_relevance_without_embedder_returns_slice():
    items = [{"title": f"P{i}", "url": f"u{i}"} for i in range(12)]
    assert len(ReferenceService.rank_by_relevance(items, "x", embedder=None)) == 8


def test_rank_by_relevance_keeps_null_when_embedding_fails():
    class BrokenEmbedder:
        def is_available(self):
            return True

        def get_embedding(self, text):
            raise RuntimeError("model missing")

    ranked = ReferenceService.rank_by_relevance(
        [{"title": "P", "url": "u"}], "x", embedder=BrokenEmbedder()
    )
    # Unmeasured relevance must stay null rather than becoming a fake 0%.
    assert ranked[0]["relevance_score"] is None
    assert ranked[0]["relevance_percentage"] is None


def test_rank_by_relevance_empty_input():
    assert ReferenceService.rank_by_relevance([], "x") == []


# ------------------------------------------------------------ fetch contract


@pytest.mark.asyncio
async def test_fetch_references_reports_failed_when_nothing_found(monkeypatch):
    async def empty_crossref(*a, **k):
        return [], False

    async def empty_arxiv(*a, **k):
        return [], False

    monkeypatch.setattr(ReferenceService, "_crossref_query", staticmethod(empty_crossref))
    monkeypatch.setattr(ReferenceService, "_crossref_after", staticmethod(empty_crossref))
    monkeypatch.setattr(ReferenceService, "_arxiv_query", staticmethod(empty_arxiv))

    refs, status = await _REAL_FETCH_REFERENCES("a real problem statement", "IoT")
    assert refs == []
    assert status == "failed"


@pytest.mark.asyncio
async def test_fetch_references_reports_partial_when_one_source_fails(monkeypatch):
    async def good(*a, **k):
        return [{"title": "Good", "doi": "10.1109/good", "url": "u1"}], True

    async def bad(*a, **k):
        return [], False

    monkeypatch.setattr(ReferenceService, "_crossref_query", staticmethod(good))
    monkeypatch.setattr(ReferenceService, "_crossref_after", staticmethod(good))
    monkeypatch.setattr(ReferenceService, "_arxiv_query", staticmethod(bad))

    refs, status = await _REAL_FETCH_REFERENCES("a real problem", "IoT")
    # One index being down must not discard the results of the others.
    assert status == "partial"
    assert [r["doi"] for r in refs] == ["10.1109/good"]


@pytest.mark.asyncio
async def test_fetch_references_succeeds_when_all_sources_work(monkeypatch):
    async def crossref(*a, **k):
        return [{"title": "Paper", "doi": "10.1109/p", "url": "u1"}], True

    async def arxiv(*a, **k):
        return [{"title": "Preprint", "doi": None, "url": "https://arxiv.org/abs/1"}], True

    monkeypatch.setattr(ReferenceService, "_crossref_query", staticmethod(crossref))
    monkeypatch.setattr(ReferenceService, "_crossref_after", staticmethod(crossref))
    monkeypatch.setattr(ReferenceService, "_arxiv_query", staticmethod(arxiv))

    refs, status = await _REAL_FETCH_REFERENCES("a real problem", "IoT")
    assert status == "success"
    assert len(refs) == 2


@pytest.mark.asyncio
async def test_fetch_references_never_raises_when_a_source_explodes(monkeypatch):
    async def explode(*a, **k):
        raise RuntimeError("network down")

    async def crossref(*a, **k):
        return [], True

    monkeypatch.setattr(ReferenceService, "_crossref_query", staticmethod(crossref))
    monkeypatch.setattr(ReferenceService, "_crossref_after", staticmethod(crossref))
    monkeypatch.setattr(ReferenceService, "_arxiv_query", staticmethod(explode))

    refs, status = await _REAL_FETCH_REFERENCES("a real problem", "IoT")
    assert refs == []
    assert status == "failed"


@pytest.mark.asyncio
async def test_fetch_references_skips_lookup_without_search_terms():
    # No network should be attempted when there is nothing to search for.
    refs, status = await _REAL_FETCH_REFERENCES("the and of", "")
    assert refs == []
    assert status == "failed"

# =========================================================== similar projects

from app.services import reference_service as rs  # noqa: E402

_REAL_FETCH_PROJECTS = ReferenceService.fetch_projects
_REAL_FETCH_BLOGS = ReferenceService.fetch_blogs
_REAL_FETCH_ALL = ReferenceService.fetch_all


def test_build_repo_queries_leads_with_the_domain():
    # "Cybersecurity & Cloud" is what makes wazuh/bunkerweb appear; a prose
    # clause from the problem statement matches nothing.
    queries = ReferenceService.build_repo_queries(
        "patients with intermittent cardiac arrhythmias", "Cybersecurity & Cloud"
    )
    assert queries[0] == "cybersecurity cloud"
    assert len(set(queries)) == len(queries), "queries must be deduplicated"


def test_build_repo_queries_falls_back_when_domain_is_generic():
    queries = ReferenceService.build_repo_queries("waste collection overflow in cities", "")
    assert queries, "must produce something even with no domain"
    assert all(len(q.split()) <= 3 for q in queries)


def test_build_repo_queries_empty_input():
    assert ReferenceService.build_repo_queries("", "") == []


def test_build_blog_tags_uses_only_the_domain():
    tags = ReferenceService.build_blog_tags("patients need monitoring", "HealthTech & Wearables")
    assert "healthtech" in tags
    assert "wearables" in tags


def test_build_blog_tags_ignores_short_words():
    assert ReferenceService.build_blog_tags("some problem", "AI & IoT") == ["iot"]


@pytest.mark.asyncio
async def test_fetch_projects_merges_and_deduplicates(monkeypatch):
    calls = []

    # Pin the queries so this exercises merge/dedupe rather than query building.
    monkeypatch.setattr(
        ReferenceService, "build_repo_queries",
        classmethod(lambda cls, p, d="": ["q1", "q2", "q3"]),
    )

    async def fake(client, query):
        calls.append(query)
        if query == "q1":
            return [
                {"kind": "project", "title": "a/one", "url": "https://github.com/a/one", "stars": 5},
            ], True
        if query == "q2":
            # Deliberately repeats one URL so dedupe has something to do.
            return [
                {"kind": "project", "title": "a/one", "url": "https://github.com/a/one", "stars": 5},
                {"kind": "project", "title": "b/two", "url": "https://github.com/b/two", "stars": 9},
            ], True
        return [], True

    monkeypatch.setattr(ReferenceService, "_github_query", staticmethod(fake))

    items, status = await _REAL_FETCH_PROJECTS("problem text", "Domain")
    assert status == "success"
    urls = [i["url"] for i in items]
    assert urls.count("https://github.com/a/one") == 1, "duplicate URL must be dropped"
    assert "https://github.com/b/two" in urls
    # A thin first result must not stop the later queries from being tried.
    assert calls == ["q1", "q2", "q3"]


@pytest.mark.asyncio
async def test_fetch_projects_reports_success_when_nothing_matched(monkeypatch):
    # GitHub answered fine but found nothing: that is an empty result, not a
    # failure, and the UI should not claim the lookup broke.
    async def empty(client, query):
        return [], True

    monkeypatch.setattr(ReferenceService, "_github_query", staticmethod(empty))
    items, status = await _REAL_FETCH_PROJECTS("problem", "Domain")
    assert items == []
    assert status == "success"


@pytest.mark.asyncio
async def test_fetch_projects_reports_failed_when_rate_limited(monkeypatch):
    async def denied(client, query):
        return [], False

    monkeypatch.setattr(ReferenceService, "_github_query", staticmethod(denied))
    items, status = await _REAL_FETCH_PROJECTS("problem", "Domain")
    assert items == []
    assert status == "failed"


# ====================================================================== blogs


@pytest.mark.asyncio
async def test_fetch_blogs_deduplicates_across_tags(monkeypatch):
    shared = {
        "kind": "article", "title": "Shared", "source_name": "a",
        "url": "https://dev.to/shared", "abstract_snippet": "x",
    }

    async def fake(client, tag):
        # dev.to returns the same article under several tags.
        return [shared, {**shared, "title": f"Only {tag}",
                         "url": f"https://dev.to/{tag}"}], True

    monkeypatch.setattr(ReferenceService, "_devto_query", staticmethod(fake))

    items, status = await _REAL_FETCH_BLOGS("problem", "cyber security")
    urls = [i["url"] for i in items]
    assert urls.count("https://dev.to/shared") == 1, "shared article must appear once"
    assert status == "success"


@pytest.mark.asyncio
async def test_fetch_blogs_without_tags_is_failed(monkeypatch):
    """A domain with nothing searchable in it is a genuine lookup failure:
    there is no tag to send dev.to."""
    items, status = await _REAL_FETCH_BLOGS("problem", " & ")
    assert items == []
    assert status == "failed"


# ========================================================== relevance filtering


def test_rank_by_relevance_applies_min_relevance_floor():
    items = [{"title": f"P{i}", "url": f"u{i}"} for i in range(10)]

    class Embedder:
        def is_available(self):
            return True

        def get_embedding(self, text):
            return [0.0]

        def calculate_cosine_similarity(self, a, b):
            # Every item scores a flat, low 0.2.
            return 0.2

    ranked = ReferenceService.rank_by_relevance(
        items, "x", embedder=Embedder(), limit=5, min_relevance=0.30
    )
    assert ranked == [], "everything below the floor should be filtered out"


def test_rank_by_relevance_respects_limit():
    items = [{"title": f"P{i}", "url": f"u{i}"} for i in range(10)]

    class Embedder:
        def is_available(self):
            return True

        def get_embedding(self, text):
            return [0.0]

        def calculate_cosine_similarity(self, a, b):
            return 0.9

    ranked = ReferenceService.rank_by_relevance(items, "x", embedder=Embedder(), limit=3)
    assert len(ranked) == 3


def test_rank_by_relevance_keeps_unmeasured_items_despite_floor():
    """No score means "unknown", not "irrelevant"."""
    items = [{"title": "P", "url": "u"}]

    class Broken:
        def is_available(self):
            return True

        def get_embedding(self, text):
            raise RuntimeError("no model")

    ranked = ReferenceService.rank_by_relevance(
        items, "x", embedder=Broken(), min_relevance=0.9
    )
    assert len(ranked) == 1
    assert ranked[0]["relevance_score"] is None


# ============================================================ orchestration


@pytest.mark.asyncio
async def test_fetch_all_returns_three_categories(monkeypatch):
    async def papers(*a, **k):
        return [{"kind": "paper", "title": "P", "doi": "10.1109/p", "url": "u1"}], "success"

    async def projects(*a, **k):
        return [{"kind": "project", "title": "G", "url": "https://github.com/g"}], "success"

    async def blogs(*a, **k):
        return [{"kind": "article", "title": "B", "url": "https://dev.to/b"}], "success"

    monkeypatch.setattr(ReferenceService, "fetch_references", staticmethod(papers))
    monkeypatch.setattr(ReferenceService, "fetch_projects", staticmethod(projects))
    monkeypatch.setattr(ReferenceService, "fetch_blogs", staticmethod(blogs))

    block = await _REAL_FETCH_ALL("problem", "Domain")
    for key in ("papers", "projects", "articles"):
        assert block[key]["count"] == 1, key
        assert block[key]["items"][0]["kind"] == key[:-1] or key == "articles"
    assert block["total"] == 3


@pytest.mark.asyncio
async def test_fetch_all_survives_one_category_exploding(monkeypatch):
    async def boom(*a, **k):
        raise RuntimeError("source down")

    async def projects(*a, **k):
        return [{"kind": "project", "title": "G", "url": "u"}], "success"

    monkeypatch.setattr(ReferenceService, "fetch_references", staticmethod(boom))
    monkeypatch.setattr(ReferenceService, "fetch_projects", staticmethod(projects))
    monkeypatch.setattr(ReferenceService, "fetch_blogs", staticmethod(boom))

    block = await _REAL_FETCH_ALL("problem", "Domain")
    assert block["papers"]["count"] == 0
    assert block["papers"]["status"] == "failed"
    assert block["projects"]["count"] == 1, "one dead source must not lose the others"


@pytest.mark.asyncio
async def test_fetch_all_keeps_legacy_top_level_keys(monkeypatch):
    """The router logs references['count'] and older payloads expect it."""
    async def papers(*a, **k):
        return [{"kind": "paper", "title": "P", "doi": "10.1109/p", "url": "u1"}], "success"

    async def none_at_all(*a, **k):
        return [], "success"

    monkeypatch.setattr(ReferenceService, "fetch_references", staticmethod(papers))
    monkeypatch.setattr(ReferenceService, "fetch_projects", staticmethod(none_at_all))
    monkeypatch.setattr(ReferenceService, "fetch_blogs", staticmethod(none_at_all))

    block = await _REAL_FETCH_ALL("problem", "Domain")
    assert block["count"] == 1
    assert block["ieee_count"] == 1
    assert "items" in block and "status" in block


# ============================================== off-topic result suppression


def test_on_topic_accepts_a_matching_title():
    item = {"title": "Wazuh: security monitoring for file integrity"}
    assert ReferenceService._on_topic(item, "Cybersecurity & Cloud", "x") is True


def test_on_topic_rejects_the_saba_saba_mismatch():
    """This exact title scored ~0.31 in live dev.to results and slipped through
    the embedding floor alone."""
    item = {"title": "What Saba Saba 2026 Reveals About Rising Costs"}
    assert ReferenceService._on_topic(item, "HealthTech & Wearables", "x") is False


def test_on_topic_matches_via_description_not_just_title():
    item = {"title": "Bucket", "description": "An open IoT bin that flags overflow"}
    assert ReferenceService._on_topic(item, "", "IoT overflow detection") is True


def test_on_topic_matches_via_tags():
    item = {"title": "Deploying FastAPI", "tags": ["cybersecurity", "hardening"]}
    assert ReferenceService._on_topic(item, "Cybersecurity & Cloud", "x") is True


def test_on_topic_defers_when_there_is_nothing_to_compare():
    # No domain and no problem words: the embedding is the only signal available.
    assert ReferenceService._on_topic({"title": "anything"}, "", "") is True


@pytest.mark.asyncio
async def test_fetch_all_drops_off_topic_blogs(monkeypatch):
    async def blogs(*a, **k):
        return [
            {"kind": "article", "title": "What Saba Saba 2026 Reveals", "url": "u1"},
            {"kind": "article", "title": "HealthTech wearables for arrhythmia detection", "url": "u2"},
        ], "success"

    async def none(*a, **k):
        return [], "success"

    monkeypatch.setattr(ReferenceService, "fetch_references", staticmethod(none))
    monkeypatch.setattr(ReferenceService, "fetch_projects", staticmethod(none))
    monkeypatch.setattr(ReferenceService, "fetch_blogs", staticmethod(blogs))

    block = await _REAL_FETCH_ALL(
        "detect arrhythmia in patients", "HealthTech & Wearables"
    )
    titles = [i["title"] for i in block["articles"]["items"]]
    assert "HealthTech wearables for arrhythmia detection" in titles
    assert "What Saba Saba 2026 Reveals" not in titles


@pytest.mark.asyncio
async def test_gate_never_empties_a_section_that_had_hits(monkeypatch):
    """An empty section tells the student the lookup failed when it worked."""
    async def blogs(*a, **k):
        return [{"kind": "article", "title": "Totally Unrelated Cooking", "url": "u"}], "success"

    async def none(*a, **k):
        return [], "success"

    monkeypatch.setattr(ReferenceService, "fetch_references", staticmethod(none))
    monkeypatch.setattr(ReferenceService, "fetch_projects", staticmethod(none))
    monkeypatch.setattr(ReferenceService, "fetch_blogs", staticmethod(blogs))

    block = await _REAL_FETCH_ALL("cardiac care", "HealthTech")
    assert block["articles"]["count"] == 1
    assert block["articles"]["status"] == "success"


def test_on_topic_matches_across_morphology():
    # "cybersecurity" (domain) must count as a hit for "security" (repo tag).
    item = {"title": "Wazuh: file integrity monitoring", "topics": ["security"]}
    assert ReferenceService._on_topic(item, "Cybersecurity & Cloud", "x") is True


def test_on_topic_ignores_short_target_words():
    # "AI" is below the meaningful-word length, so it never enters the target
    # set and the gate defers to the embedding instead of matching everything.
    assert ReferenceService._on_topic({"title": "Blockchain train"}, "AI", "x") is True


def test_on_topic_containment_requires_five_chars_on_both_sides():
    """Both sides must clear the 5-character bar, so a 4-letter target like
    "data" does not match "database". Kept deliberately conservative: the gate
    only removes confident mismatches."""
    assert ReferenceService._on_topic(
        {"title": "A database for postgres"}, "", "data pipelines"
    ) is False
    assert ReferenceService._on_topic(
        {"title": "Storage pipelines for postgres"}, "", "data pipelines"
    ) is True


# ======================================================== near-duplicate collapse


def test_dedupe_collapses_reworded_blog_titles():
    """Both of these came back from dev.to for the same topic."""
    items = [
        {"title": "A Practical Guide to Web Application Scalability: From Zero"},
        {"title": "Web Application Scalability: A Practical Guide"},
        {"title": "Caching Strategies Explained End to End"},
    ]
    out = ReferenceService._dedupe_near_duplicates(items)
    assert len(out) == 2
    assert out[0]["title"].startswith("A Practical Guide"), "best-ranked copy must win"


def test_dedupe_collores_same_repo_with_dashes_and_underscores():
    items = [
        {"title": "schandhu83-cmyk/Optimizing--User--Group--And--Role--Access"},
        {"title": "schandhu83-cmyk/Optimizing_User_Group_And_Role_Management"},
        {"title": "wazuh/wazuh"},
    ]
    out = ReferenceService._dedupe_near_duplicates(items)
    assert len(out) == 2, "same repo listed twice is noise for a student"
    assert out[1]["title"] == "wazuh/wazuh", "distinct repos must survive"


def test_dedupe_keeps_genuinely_different_titles():
    items = [
        {"title": "Web Application Scalability: A Practical Guide"},
        {"title": "How to Deploy a Django App on Railway"},
        {"title": "Postgres Indexing Basics"},
    ]
    assert len(ReferenceService._dedupe_near_duplicates(items)) == 3


def test_dedupe_tolerates_titleless_items():
    items = [{"title": ""}, {"title": None}, {"title": "A Valid Title"}]
    assert len(ReferenceService._dedupe_near_duplicates(items)) == 3


# ============================================== GitHub rate-limit retry


@pytest.mark.asyncio
async def test_github_query_retries_once_after_403(monkeypatch):
    """Unauthenticated search allows 10 req/min; one retry recovers a burst."""
    attempts = []

    class FakeResponse:
        def __init__(self, code, payload=None):
            self.status_code = code
            self._payload = payload or {"items": []}

        def json(self):
            return self._payload

    class FakeClient:
        async def get(self, *a, **k):
            attempts.append(1)
            if len(attempts) == 1:
                return FakeResponse(403)
            return FakeResponse(200, {"items": [
                {"full_name": "a/b", "html_url": "https://github.com/a/b",
                 "stargazers_count": 3, "description": "d", "topics": []},
            ]})

    async def no_sleep(_):
        return None

    monkeypatch.setattr(rs.asyncio, "sleep", no_sleep)

    items, ok = await ReferenceService._github_query(FakeClient(), "retry-once")
    assert ok is True
    assert len(attempts) == 2, "should have retried exactly once"
    assert items[0]["title"] == "a/b"


@pytest.mark.asyncio
async def test_github_query_gives_up_after_second_403(monkeypatch):
    attempts = []

    class FakeResponse:
        status_code = 403

        def json(self):
            return {"items": []}

    class FakeClient:
        async def get(self, *a, **k):
            attempts.append(1)
            return FakeResponse()

    async def no_sleep(_):
        return None

    monkeypatch.setattr(rs.asyncio, "sleep", no_sleep)

    items, ok = await ReferenceService._github_query(FakeClient(), "retry-twice")
    assert items == []
    assert ok is False
    assert len(attempts) == 2, "must not retry forever"


@pytest.mark.asyncio
async def test_github_query_does_not_retry_on_422(monkeypatch):
    """A malformed query will never succeed; retrying only burns quota."""
    attempts = []

    class FakeResponse:
        status_code = 422

        def json(self):
            return {"items": []}

    class FakeClient:
        async def get(self, *a, **k):
            attempts.append(1)
            return FakeResponse()

    await ReferenceService._github_query(FakeClient(), "no-retry-422")
    assert len(attempts) == 1


def test_build_blog_tags_falls_back_for_short_domains():
    # "AI" has no word of length >= 3, but dev.to does tag posts as "ai".
    assert ReferenceService.build_blog_tags("some problem", "AI") == ["ai"]
    assert ReferenceService.build_blog_tags("some problem", "IoT") == ["iot"]


def test_build_blog_tags_still_empty_for_nonsense_domain():
    assert ReferenceService.build_blog_tags("some problem", " & ") == []
