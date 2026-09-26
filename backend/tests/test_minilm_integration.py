import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.embedding_service import EmbeddingService
from app.services.online_search_service import OnlineSearchService

client = TestClient(app)

def test_minilm_embedding_generation():
    """Verify that sentence-transformers/all-MiniLM-L6-v2 generates 384-dimensional embeddings."""
    text = "AI system for detecting fake news on social media"
    
    EmbeddingService.load_model()
    embedding = EmbeddingService.get_embedding(text)
    
    assert isinstance(embedding, list)
    assert len(embedding) == 384, f"Expected 384 dimensions, got {len(embedding)}"

def test_cosine_similarity_calculation():
    """Verify cosine similarity calculation between vectors."""
    v1 = [0.1] * 384
    v2 = [0.1] * 384
    v3 = [-0.1] * 384
    
    sim_identical = EmbeddingService.calculate_cosine_similarity(v1, v2)
    assert pytest.approx(sim_identical, 0.001) == 1.0
    
    sim_opposite = EmbeddingService.calculate_cosine_similarity(v1, v3)
    assert pytest.approx(sim_opposite, 0.001) == -1.0

def test_online_search_keyword_extraction():
    """Verify search keyword extraction from student problem statement."""
    problem = "Fake articles and unverified rumors are spreading rapidly on social media, making it difficult for users to distinguish reliable information."
    keywords = OnlineSearchService.extract_search_keywords(problem)
    assert "fake" in keywords.lower() or "articles" in keywords.lower() or "rumors" in keywords.lower()

def test_rank_online_sources_with_minilm():
    """Verify MiniLM problem statement semantic ranking and threshold filtering."""
    EmbeddingService.load_model()
    
    student_problem = "Fake articles and unverified rumors are spreading rapidly on social media, making it difficult for users to distinguish reliable information from misinformation."
    
    candidates = [
        {
            "title": "Fake News Detection Using Machine Learning",
            "problem": "Detecting false or misleading news content shared through online social platforms.",
            "description": "An open source machine learning classifier for identifying misinformation.",
            "source_type": "GitHub",
            "source_name": "GitHub Repository",
            "source_url": "https://github.com/example/fake-news-detector"
        },
        {
            "title": "Automated Fact Checking System",
            "problem": "Automatically verifying claims and identifying potentially false social media information.",
            "description": "NLP model trained to cross-reference claims against verified sources.",
            "source_type": "Research Paper",
            "source_name": "arXiv",
            "source_url": "http://arxiv.org/abs/2101.12345"
        },
        {
            "title": "Solar Powered Water Purifier",
            "problem": "Lack of clean drinking water in off-grid rural communities.",
            "description": "Solar distillation kit for rural villages.",
            "source_type": "Product",
            "source_name": "Open Source Project",
            "source_url": "https://example.com/solar-water"
        }
    ]
    
    # Rank candidates with threshold MIN_SIMILARITY = 0.35
    ranked = EmbeddingService.rank_online_sources(student_problem, candidates, min_similarity=0.35, top_k=5)
    
    assert len(ranked) >= 2
    # The top candidate must be fake news related
    assert "Fake News" in ranked[0]["title"] or "Fact Checking" in ranked[0]["title"]
    assert ranked[0]["similarity_score"] >= 0.35
    assert ranked[0]["source_url"].startswith("http")
    
    # Verify solar purifier (unrelated problem) is ranked much lower or filtered out
    if len(ranked) > 2:
        assert ranked[0]["similarity_score"] > ranked[2]["similarity_score"]

def test_api_innovation_advisor_online_sources():
    """Verify end-to-end API integration retrieving online candidate solutions."""
    # Create test project
    p_res = client.post("/api/projects", json={
        "title": "Social Media Fact Checker",
        "description": "AI tool for identifying unverified claims online.",
        "domain": "Artificial Intelligence"
    })
    assert p_res.status_code == 201
    p_id = p_res.json()["id"]
    
    # Submit innovation analysis
    a_res = client.post("/api/innovation/analyze", json={
        "project_id": p_id,
        "project_title": "Social Media Fact Checker",
        "problem_statement": "Fake articles and unverified rumors are spreading rapidly on social media platforms.",
        "proposed_solution": "Automated AI system for detecting fake news on social media.",
        "target_users": "Social media users & journalists",
        "technology_domain": "NLP & Sentence Transformers",
        "expected_impact": "Reduces viral spread of false articles."
    })
    assert a_res.status_code == 201
    a_data = a_res.json()["analysis_data"]
    
    assert "semantic_analysis" in a_data
    sem = a_data["semantic_analysis"]
    assert sem["embedding_dimension"] == 384
    assert sem["search_status"] in ["success", "no_results_above_threshold", "failed"]
    
    if sem["search_status"] == "success":
        top_ideas = sem["top_similar_ideas"]
        assert len(top_ideas) <= 5
        for item in top_ideas:
            assert "source_url" in item
            assert item["source_url"].startswith("http")
            assert "title" in item
            assert "similarity_score" in item
            assert item["similarity_score"] >= 0.35
            print("\n[VERIFICATION TEST PASSED] Online Solution:", item["title"], "URL:", item["source_url"], "Similarity:", item["similarity_percentage"])
