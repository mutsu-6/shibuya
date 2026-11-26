from fastapi.testclient import TestClient
import app

client = TestClient(app.app)

def test_dashboard_initial():
    response = client.get("/dashboard")
    assert response.status_code == 200
    expected = {
        "news_count": 0, 
        "issue_count": 0, 
        "comment_count": 0, 
        "community_count": 0
    }
    assert response.json() == expected


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
    result = response.json()
    assert result["news_count"] == 1
    assert result["issue_count"] == 1


def test_get_news():
    response = client.get("/news")
    assert response.status_code == 200
    assert "news" in response.json()


def test_add_comment():
    # まずニュースを追加
    news = {"title": "テストニュース", "content": "テスト内容"}
    client.post("/news", json=news)
    
    # コメントを追加
    comment = {
        "news_id": 0,
        "user_id": "test_user",
        "content": "テストコメント",
        "comment_type": "共感"
    }
    
    response = client.post("/comments", json=comment)
    assert response.status_code == 200
    assert response.json()["status"] == "success"
