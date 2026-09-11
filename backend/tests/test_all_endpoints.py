import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"

def test_projects_crud():
    # Create project
    create_res = client.post(
        "/api/projects",
        json={
            "title": "Test Innovation Project",
            "description": "A test project description",
            "domain": "Artificial Intelligence"
        }
    )
    assert create_res.status_code == 201
    project_data = create_res.json()
    project_id = project_data["id"]
    assert project_data["title"] == "Test Innovation Project"

    # List projects
    list_res = client.get("/api/projects")
    assert list_res.status_code == 200
    projects = list_res.json()
    assert len(projects) > 0

    # Get single project
    get_res = client.get(f"/api/projects/{project_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == project_id

def test_journey_endpoints():
    # Create project first
    proj_res = client.post(
        "/api/projects",
        json={"title": "Journey Test Proj", "description": "Desc", "domain": "Tech"}
    )
    pid = proj_res.json()["id"]

    # Get journey
    j_res = client.get(f"/api/journey/{pid}")
    assert j_res.status_code == 200
    j_data = j_res.json()
    assert "stages" in j_data
    assert "total_xp" in j_data

    # Complete stage
    comp_res = client.post(
        f"/api/journey/{pid}/complete-stage",
        json={"stage_name": "Idea"}
    )
    assert comp_res.status_code == 200
    assert comp_res.json()["completed_count"] >= 1

def test_innovation_analysis():
    proj_res = client.post(
        "/api/projects",
        json={"title": "Innovation Test Proj", "description": "Desc", "domain": "Tech"}
    )
    pid = proj_res.json()["id"]

    analyze_res = client.post(
        "/api/innovation/analyze",
        json={
            "project_id": pid,
            "project_title": "Innovation Test Proj",
            "problem_statement": "High waste in urban centers",
            "proposed_solution": "IoT monitoring system",
            "target_users": "Municipalities",
            "technology_domain": "IoT & AI",
            "expected_impact": "30% reduction in waste truck routes"
        }
    )
    assert analyze_res.status_code == 201
    analysis_data = analyze_res.json()
    assert analysis_data["project_id"] == pid
    assert "innovation_score" in analysis_data["analysis_data"]

    # Get innovation analysis
    get_res = client.get(f"/api/innovation/{pid}")
    assert get_res.status_code == 200
    assert get_res.json()["project_id"] == pid

def test_research_gap_analysis():
    proj_res = client.post(
        "/api/projects",
        json={"title": "Research Gap Test", "description": "Desc", "domain": "Tech"}
    )
    pid = proj_res.json()["id"]

    analyze_res = client.post(
        "/api/research-gap/analyze",
        json={
            "project_id": pid,
            "research_topic": "Autonomous Garbage Collectors",
            "problem_area": "Sensor degradation in rainy conditions",
            "existing_solution": "Ultrasonic sensors",
            "target_domain": "Robotics"
        }
    )
    assert analyze_res.status_code == 201
    gap_data = analyze_res.json()
    assert gap_data["project_id"] == pid
    assert "research_gap" in gap_data["gap_data"]

    # Get research gap
    get_res = client.get(f"/api/research-gap/{pid}")
    assert get_res.status_code == 200
    assert get_res.json()["project_id"] == pid

def test_readiness_calculator():
    proj_res = client.post(
        "/api/projects",
        json={"title": "Readiness Test", "description": "Desc", "domain": "Tech"}
    )
    pid = proj_res.json()["id"]

    readiness_res = client.get(f"/api/readiness/{pid}")
    assert readiness_res.status_code == 200
    r_data = readiness_res.json()
    assert "overall_score" in r_data

def test_pitch_generator():
    proj_res = client.post(
        "/api/projects",
        json={"title": "Pitch Test Proj", "description": "Desc", "domain": "Tech"}
    )
    pid = proj_res.json()["id"]

    gen_res = client.post(
        "/api/pitch/generate",
        json={"project_id": pid}
    )
    assert gen_res.status_code == 201
    p_data = gen_res.json()
    assert p_data["project_id"] == pid
    assert "pitch_script" in p_data["pitch_data"]

    # Get pitch
    get_res = client.get(f"/api/pitch/{pid}")
    assert get_res.status_code == 200
    assert get_res.json()["project_id"] == pid
