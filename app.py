from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="Shibuya Co-creation Dashboard")

# In-memory stores for demonstration purposes
news_items = []
issue_cards = []

class NewsItem(BaseModel):
    title: str
    content: str

class IssueCard(BaseModel):
    title: str
    audience: str
    location: str
    perspective: str
    hypothesis: Optional[str] = None
    kpi: List[str] = []

@app.get("/")
async def root():
    return {"message": "Shibuya Co-creation Dashboard API"}

@app.post("/news")
async def add_news(item: NewsItem):
    news_items.append(item)
    return {"status": "ok", "count": len(news_items)}

@app.post("/issue")
async def add_issue(card: IssueCard):
    issue_cards.append(card)
    return {"status": "ok", "count": len(issue_cards)}

@app.get("/dashboard")
async def dashboard():
    return {
        "news_count": len(news_items),
        "issue_count": len(issue_cards)
    }
