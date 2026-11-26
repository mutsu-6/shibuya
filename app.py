from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime
import logging
from news_scraper import ShibuyaNewsScraper
from news_summarizer import NewsSummarizer
from kpi_generator import KPIGenerator

# ログ設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Shibuya Co-creation Dashboard")

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://192.168.150.79:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory stores for demonstration purposes
news_items = []
issue_cards = []
comments = []
communities = []
kpis = []

# AI機能の初期化
news_scraper = ShibuyaNewsScraper()
news_summarizer = NewsSummarizer()
kpi_generator = KPIGenerator()

class NewsItem(BaseModel):
    title: str
    content: str
    summaries: Optional[Dict[str, str]] = None
    url: Optional[str] = None
    date: Optional[str] = None
    source: Optional[str] = None
    created_at: Optional[str] = None

class IssueCard(BaseModel):
    title: str
    audience: str
    location: str
    perspective: str
    hypothesis: Optional[str] = None
    kpi: List[str] = []

class Comment(BaseModel):
    news_id: int
    user_id: str
    content: str
    comment_type: str  # 共感、質問、改善提案、感謝
    filtered_content: Optional[str] = None
    created_at: Optional[str] = None

class CommentSuggestion(BaseModel):
    news_id: int

@app.get("/")
async def root():
    return {"message": "Shibuya Co-creation Dashboard API"}

@app.post("/news")
async def add_news(item: NewsItem):
    item.created_at = datetime.now().isoformat()
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
        "comment_count": len(comments),
        "community_count": len(communities)
    }

# 新しいエンドポイント群

@app.post("/scrape-news")
async def scrape_shibuya_news(background_tasks: BackgroundTasks):
    """渋谷区公式サイトからニュースを収集"""
    logger.info("🚀 ニュース収集開始")
    # デバッグポイント: ここでブレークポイントを設定可能
    import pdb; pdb.set_trace() if False else None  # デバッグ用（必要時にTrueに変更）
    try:
        logger.info("📡 news_scraper.scrape_news_list() を呼び出し中...")
        scraped_news = news_scraper.scrape_news_list()
        logger.info(f"📰 スクレイピング結果: {len(scraped_news)}件のニュースを取得")
        
        if not scraped_news:
            logger.warning("⚠️ スクレイピングで取得されたニュースが0件です")
            return {
                "status": "success",
                "scraped_count": 0,
                "total_news": len(news_items),
                "message": "新しいニュースは見つかりませんでした"
            }
        
        processed_count = 0
        for i, news_data in enumerate(scraped_news):
            logger.info(f"📝 ニュース {i+1}/{len(scraped_news)} を処理中: {news_data.get('title', 'タイトル不明')}")
            
            try:
                # 要約を生成
                logger.info("🤖 AI要約を生成中...")
                summaries = news_summarizer.summarize_news(
                    news_data['title'], 
                    news_data.get('content', news_data['title'])
                )
                logger.info(f"✅ AI要約完了: {len(summaries)}種類の要約を生成")
                
                # NewsItemオブジェクトを作成
                news_item = NewsItem(
                    title=news_data['title'],
                    content=news_data.get('content', ''),
                    summaries=summaries,
                    url=news_data.get('url'),
                    date=news_data.get('date'),
                    source=news_data.get('source'),
                    created_at=datetime.now().isoformat()
                )
                
                news_items.append(news_item)
                processed_count += 1
                logger.info(f"💾 ニュースアイテムを保存: {news_item.title}")
                
            except Exception as item_error:
                logger.error(f"❌ ニュースアイテム処理エラー: {item_error}")
                continue
        
        logger.info(f"🎉 ニュース収集完了: {processed_count}件処理, 合計{len(news_items)}件")
        return {
            "status": "success",
            "scraped_count": processed_count,
            "total_news": len(news_items)
        }
        
    except Exception as e:
        logger.error(f"💥 ニュース収集エラー: {e}")
        logger.error(f"エラータイプ: {type(e).__name__}")
        import traceback
        logger.error(f"スタックトレース: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"ニュース収集に失敗しました: {str(e)}")

@app.get("/news")
async def get_news():
    """ニュース一覧を取得"""
    logger.info("📡 /news エンドポイント呼び出し")
    logger.info(f"📊 現在のnews_items数: {len(news_items)}")
    logger.info(f"📰 news_items内容: {[item.title[:50] + '...' if len(item.title) > 50 else item.title for item in news_items]}")
    
    response_data = {"news": news_items}
    logger.info(f"📤 レスポンスデータ構造: {list(response_data.keys())}")
    logger.info(f"📊 レスポンス内news配列長: {len(response_data['news'])}")
    
    return response_data

@app.post("/frontend-log")
async def frontend_log(log_data: dict):
    """フロントエンドからのログを受信"""
    level = log_data.get("level", "INFO")
    message = log_data.get("message", "")
    data = log_data.get("data", {})
    
    if level == "ERROR":
        logger.error(f"🖥️ Frontend: {message}")
        if data:
            logger.error(f"🖥️ Frontend Data: {data}")
    else:
        logger.info(f"🖥️ Frontend: {message}")
        if data:
            logger.info(f"🖥️ Frontend Data: {data}")
    
    return {"status": "logged"}

@app.get("/news/{news_id}/comment-suggestions")
async def get_comment_suggestions(news_id: int, comment_type: Optional[str] = None):
    """特定のニュースに対するコメント候補を取得"""
    try:
        if news_id >= len(news_items) or news_id < 0:
            raise HTTPException(status_code=404, detail="ニュースが見つかりません")
        
        news_item = news_items[news_id]
        
        if comment_type:
            # 特定のコメントタイプに基づいた候補を生成
            suggestions = news_summarizer.generate_typed_comment_suggestions(
                news_item.title,
                news_item.summaries.get("解説", news_item.content) if news_item.summaries else news_item.content,
                comment_type
            )
        else:
            # 一般的な候補を生成
            suggestions = news_summarizer.generate_comment_suggestions(
                news_item.title,
                news_item.summaries.get("解説", news_item.content) if news_item.summaries else news_item.content
            )
        
        return {"suggestions": suggestions, "comment_type": comment_type}
        
    except Exception as e:
        logger.error(f"コメント候補生成エラー: {e}")
        raise HTTPException(status_code=500, detail=f"コメント候補の生成に失敗しました: {str(e)}")

@app.post("/comments")
async def add_comment(comment: Comment):
    """コメントを追加（AIフィルタリング付き）"""
    try:
        # コメントをAIでフィルタリング
        filtered_content = news_summarizer.filter_comment(comment.content)
        
        comment.filtered_content = filtered_content
        comment.created_at = datetime.now().isoformat()
        
        comments.append(comment)
        
        # コミュニティマッチングのロジック（簡易版）
        # 同じcomment_typeを持つユーザーをグループ化
        matching_users = [
            c.user_id for c in comments 
            if c.comment_type == comment.comment_type and c.user_id != comment.user_id
        ]
        
        if len(matching_users) >= 1:  # 2人以上でコミュニティ形成
            community = {
                "id": len(communities),
                "type": comment.comment_type,
                "members": [comment.user_id] + matching_users[:3],  # 最大4人
                "news_id": comment.news_id,
                "created_at": datetime.now().isoformat()
            }
            communities.append(community)
        
        # AIチャットボットの初期レスポンスを生成
        news_item = news_items[comment.news_id] if comment.news_id < len(news_items) else None
        ai_response = None
        
        if news_item:
            ai_response = news_summarizer.generate_chat_response(
                comment.content,
                comment.comment_type,
                news_item.title,
                news_item.summaries.get("解説", news_item.content) if news_item.summaries else news_item.content
            )
        
        return {
            "status": "success",
            "comment_id": len(comments) - 1,
            "filtered_content": filtered_content,
            "community_matched": len(matching_users) >= 1,
            "ai_response": ai_response
        }
        
    except Exception as e:
        logger.error(f"コメント追加エラー: {e}")
        raise HTTPException(status_code=500, detail=f"コメントの追加に失敗しました: {str(e)}")

@app.post("/chat")
async def chat_with_ai(request: dict):
    """AIチャットボットとの会話"""
    try:
        message = request.get("message", "")
        news_id = request.get("news_id", 0)
        conversation_history = request.get("conversation_history", [])
        
        if news_id >= len(news_items) or news_id < 0:
            raise HTTPException(status_code=404, detail="ニュースが見つかりません")
        
        news_item = news_items[news_id]
        
        # AIチャットレスポンスを生成
        ai_response = news_summarizer.generate_chat_conversation(
            message,
            conversation_history,
            news_item.title,
            news_item.summaries.get("解説", news_item.content) if news_item.summaries else news_item.content
        )
        
        return {
            "status": "success",
            "ai_response": ai_response,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"AIチャットエラー: {e}")
        raise HTTPException(status_code=500, detail=f"AIチャットに失敗しました: {str(e)}")

@app.get("/comments")
async def get_comments(news_id: Optional[int] = None):
    """コメント一覧を取得"""
    if news_id is not None:
        filtered_comments = [c for c in comments if c.news_id == news_id]
        return {"comments": filtered_comments}
    return {"comments": comments}

@app.get("/communities")
async def get_communities():
    """コミュニティ一覧を取得"""
    return {"communities": communities}

@app.get("/communities/{community_id}")
async def get_community(community_id: int):
    """特定のコミュニティの詳細を取得"""
    if community_id >= len(communities) or community_id < 0:
        raise HTTPException(status_code=404, detail="コミュニティが見つかりません")
    
    community = communities[community_id]
    
    # コミュニティ内のコメントを取得
    community_comments = [
        c for c in comments 
        if c.user_id in community["members"] and c.news_id == community["news_id"]
    ]
    
    return {
        "community": community,
        "comments": community_comments
    }

# KPI関連エンドポイント

@app.post("/generate-kpis")
async def generate_kpis():
    """コミュニティの会話からKPIを生成"""
    try:
        # 現在のコミュニティとコメントからKPIを生成
        kpi_candidates = kpi_generator.analyze_community_conversations(communities, comments)
        prioritized_kpis = kpi_generator.calculate_kpi_priority(kpi_candidates)
        
        # 既存のKPIリストを更新
        global kpis
        kpis = prioritized_kpis
        
        return {
            "status": "success",
            "kpi_count": len(kpis),
            "top_kpis": kpis[:5]
        }
        
    except Exception as e:
        logger.error(f"KPI生成エラー: {e}")
        raise HTTPException(status_code=500, detail=f"KPI生成に失敗しました: {str(e)}")

@app.get("/kpis")
async def get_kpis():
    """KPI一覧を取得"""
    return {"kpis": kpis}

@app.post("/kpis/{kpi_index}/select")
async def select_kpi(kpi_index: int, user_id: str):
    """ユーザーがKPIを重要だと選択"""
    global kpis
    try:
        if kpi_index >= len(kpis) or kpi_index < 0:
            raise HTTPException(status_code=404, detail="KPIが見つかりません")
        
        kpis[kpi_index]['selected_by_users'] += 1
        
        # 優先度を再計算（選択数も考慮）
        kpis[kpi_index]['priority_score'] += 5  # 選択されるたびに+5
        
        # 優先度順に再ソート
        kpis = sorted(kpis, key=lambda x: x['priority_score'], reverse=True)
        
        return {
            "status": "success",
            "kpi_name": kpis[kpi_index]['name'],
            "selection_count": kpis[kpi_index]['selected_by_users']
        }
        
    except Exception as e:
        logger.error(f"KPI選択エラー: {e}")
        raise HTTPException(status_code=500, detail=f"KPI選択に失敗しました: {str(e)}")

@app.get("/dashboard/summary")
async def get_dashboard_summary():
    """ダッシュボードサマリーを取得"""
    logger.info("📡 /dashboard/summary エンドポイント呼び出し")
    try:
        # コメントオブジェクトを辞書に変換
        comments_dict = []
        for comment in comments:
            if hasattr(comment, '__dict__'):
                # Commentオブジェクトの場合
                comment_dict = {
                    'content': comment.content,
                    'comment_type': comment.comment_type,
                    'user_id': comment.user_id,
                    'news_id': comment.news_id,
                    'created_at': comment.created_at.isoformat() if hasattr(comment.created_at, 'isoformat') else str(comment.created_at)
                }
                comments_dict.append(comment_dict)
            else:
                # 既に辞書の場合
                comments_dict.append(comment)
        
        logger.info(f"📊 変換後コメント数: {len(comments_dict)}")
        summary = kpi_generator.generate_dashboard_summary(kpis, comments_dict)
        
        # 追加の統計情報
        summary.update({
            "total_news": len(news_items),
            "total_issues": len(issue_cards),
            "total_communities": len(communities),
            "total_kpis": len(kpis)
        })
        
        return summary
        
    except Exception as e:
        logger.error(f"ダッシュボードサマリー取得エラー: {e}")
        raise HTTPException(status_code=500, detail=f"サマリー取得に失敗しました: {str(e)}")

@app.get("/dashboard/analytics")
async def get_analytics():
    """詳細な分析データを取得"""
    try:
        from collections import Counter
        
        # コメント分析
        comment_by_type = Counter([c.comment_type for c in comments])
        comment_by_news = Counter([c.news_id for c in comments])
        
        # コミュニティ分析
        community_by_type = Counter([c.get('type') for c in communities])
        
        # KPI分析
        kpi_by_community_type = Counter()
        for kpi in kpis:
            for community_type in kpi.get('community_types', []):
                kpi_by_community_type[community_type] += 1
        
        return {
            "comment_analysis": {
                "by_type": dict(comment_by_type),
                "by_news": dict(comment_by_news),
                "total": len(comments)
            },
            "community_analysis": {
                "by_type": dict(community_by_type),
                "total": len(communities),
                "average_size": sum(len(c.get('members', [])) for c in communities) / len(communities) if communities else 0
            },
            "kpi_analysis": {
                "by_community_type": dict(kpi_by_community_type),
                "total": len(kpis),
                "selected_count": sum(kpi.get('selected_by_users', 0) for kpi in kpis)
            },
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"分析データ取得エラー: {e}")
        raise HTTPException(status_code=500, detail=f"分析データ取得に失敗しました: {str(e)}")
