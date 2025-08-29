from fastapi.testclient import TestClient
import pytest
import app

client = TestClient(app.app)


@pytest.fixture(autouse=True)
def reset_state():
    """Reset in-memory stores before each test."""
    app.news_items.clear()
    app.issue_cards.clear()
    app.communities.clear()
    app.user_communities.clear()

def test_dashboard_initial():
    response = client.get("/dashboard")
    assert response.status_code == 200
    assert response.json() == {"news_count": 0, "issue_count": 0, "community_count": 0}


def test_full_flow():
    news = {"title": "テストニュース", "content": "内容"}
    issue = {
        "title": "テスト課題",
        "author": "alice",
        "audience": "市民",
        "location": "渋谷",
        "perspective": "公共",
        "hypothesis": None,
        "kpi": []
    }
    community_action = {"user": "alice", "community": "shibuya"}

    client.post("/news", json=news)
    client.post("/issue", json=issue)
    client.post("/community/join", json=community_action)

    dashboard = client.get("/dashboard").json()
    assert dashboard == {"news_count": 1, "issue_count": 1, "community_count": 1}

    communities = client.get("/community").json()
    assert communities == {"shibuya": 1}

    mypage = client.get("/mypage/alice").json()
    assert mypage == {"communities": ["shibuya"], "issues": 1}
