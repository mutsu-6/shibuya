from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional, Dict, Set

app = FastAPI(title="Shibuya Co-creation Dashboard")

# In-memory stores for demonstration purposes
news_items = []
issue_cards = []
communities: Dict[str, Set[str]] = {}
user_communities: Dict[str, Set[str]] = {}

class NewsItem(BaseModel):
    title: str
    content: str

class IssueCard(BaseModel):
    title: str
    author: str
    audience: str
    location: str
    perspective: str
    hypothesis: Optional[str] = None
    kpi: List[str] = []

class CommunityAction(BaseModel):
    user: str
    community: str

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
        "issue_count": len(issue_cards),
        "community_count": len(communities)
    }


@app.post("/community/join")
async def join_community(action: CommunityAction):
    communities.setdefault(action.community, set()).add(action.user)
    user_communities.setdefault(action.user, set()).add(action.community)
    return {"status": "ok", "community": action.community}


@app.get("/community")
async def list_communities():
    return {name: len(users) for name, users in communities.items()}


@app.get("/mypage/{user}")
async def mypage(user: str):
    user_comms = list(user_communities.get(user, []))
    user_issues = [card for card in issue_cards if card.author == user]
    return {"communities": user_comms, "issues": len(user_issues)}
