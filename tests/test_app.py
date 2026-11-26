from fastapi.testclient import TestClient
import app

client = TestClient(app.app)

def test_dashboard_initial():
    response = client.get("/dashboard")
    assert response.status_code == 200
    assert response.json() == {"news_count": 0, "issue_count": 0}


def test_add_news_and_issue():
    news = {"title": "テストニュース", "content": "内容"}
    issue = {
        "title": "テスト課題",
        "audience": "市民",
        "location": "渋谷",
        "perspective": "公共",
        "hypothesis": None,
        "kpi": []
    }

    client.post("/news", json=news)
    client.post("/issue", json=issue)
    response = client.get("/dashboard")
    assert response.json() == {"news_count": 1, "issue_count": 1}
