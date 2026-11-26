#!/usr/bin/env python3
"""
渋谷共創ダッシュボード - 完全デモ
Ollamaを使用したAI機能の完全テスト
"""

import json
from datetime import datetime
from news_scraper import ShibuyaNewsScraper
from news_summarizer import NewsSummarizer
from kpi_generator import KPIGenerator
from ai_adapter import ai_adapter

def demo_full_workflow():
    """完全なワークフローのデモ"""
    print("🏢 渋谷共創ダッシュボード - 完全デモ")
    print("=" * 60)
    
    # 1. AI接続確認
    print("1️⃣ AI接続確認")
    provider_info = ai_adapter.get_provider_info()
    print(f"   プロバイダー: {provider_info['provider']}")
    print(f"   モデル: {provider_info['model']}")
    print(f"   ステータス: {provider_info['status']}")
    
    if not ai_adapter.test_connection():
        print("❌ AI接続に失敗しました")
        return
    print("✅ AI接続成功")
    print()
    
    # 2. ニュース収集
    print("2️⃣ ニュース収集")
    scraper = ShibuyaNewsScraper()
    news_list = scraper.scrape_news_list()
    print(f"✅ {len(news_list)}件のニュースを収集")
    
    if news_list:
        sample_news = news_list[0]
        print(f"   サンプル: {sample_news['title']}")
    print()
    
    # 3. AI要約
    print("3️⃣ AI要約機能")
    summarizer = NewsSummarizer()
    
    test_title = "渋谷区総合防災訓練を実施"
    test_content = "渋谷区では、災害に備えるため区内11地区で総合防災訓練を実施します。市民の皆様の参加をお待ちしています。"
    
    summaries = summarizer.summarize_news(test_title, test_content)
    print("   要約結果:")
    for key, value in summaries.items():
        print(f"   {key}: {value}")
    print()
    
    # 4. コメント候補生成
    print("4️⃣ コメント候補生成")
    suggestions = summarizer.generate_comment_suggestions(test_title, summaries["解説"])
    print("   コメント候補:")
    for suggestion in suggestions:
        print(f"   {suggestion['type']}: {suggestion['text']}")
    print()
    
    # 5. コメントフィルタリング
    print("5️⃣ コメントフィルタリング")
    test_comment = "この防災訓練はとても重要だと思います。もっと多くの人に参加してほしいです。"
    filtered = summarizer.filter_comment(test_comment)
    print(f"   元のコメント: {test_comment}")
    print(f"   フィルタ後: {filtered}")
    print()
    
    # 6. コミュニティとKPI生成のシミュレーション
    print("6️⃣ コミュニティ・KPI生成シミュレーション")
    
    # サンプルコミュニティとコメント
    sample_communities = [
        {
            "id": 0,
            "type": "改善提案",
            "members": ["user1", "user2", "user3"],
            "news_id": 0,
            "created_at": datetime.now().isoformat()
        }
    ]
    
    sample_comments = [
        {
            "user_id": "user1",
            "content": "防災訓練の参加方法をもっと分かりやすくしてほしい",
            "comment_type": "改善提案",
            "news_id": 0,
            "filtered_content": "防災訓練の参加方法をもっと分かりやすくしてほしい"
        },
        {
            "user_id": "user2",
            "content": "子育て世代も参加しやすい時間帯での開催を希望します",
            "comment_type": "改善提案", 
            "news_id": 0,
            "filtered_content": "子育て世代も参加しやすい時間帯での開催を希望します"
        },
        {
            "user_id": "user3",
            "content": "外国人住民向けの多言語対応も必要だと思います",
            "comment_type": "改善提案",
            "news_id": 0,
            "filtered_content": "外国人住民向けの多言語対応も必要だと思います"
        }
    ]
    
    # KPI生成
    kpi_generator = KPIGenerator()
    kpi_candidates = kpi_generator.analyze_community_conversations(sample_communities, sample_comments)
    prioritized_kpis = kpi_generator.calculate_kpi_priority(kpi_candidates)
    
    print("   生成されたKPI:")
    for i, kpi in enumerate(prioritized_kpis[:3]):
        print(f"   {i+1}. {kpi['name']}")
        print(f"      説明: {kpi['description']}")
        print(f"      測定方法: {kpi['measurement']}")
        print(f"      優先度: {kpi['priority_score']}")
        print()
    
    # 7. ダッシュボードサマリー
    print("7️⃣ ダッシュボードサマリー")
    dashboard_summary = kpi_generator.generate_dashboard_summary(prioritized_kpis, sample_comments)
    print("   統計情報:")
    print(f"   - コメント総数: {dashboard_summary['total_comments']}件")
    print(f"   - コメントタイプ別: {dashboard_summary['comment_types']}")
    print(f"   - 上位KPI数: {len(dashboard_summary['top_kpis'])}個")
    print()
    
    # 8. 完了メッセージ
    print("8️⃣ デモ完了")
    print("✨ 全ての機能が正常に動作しました！")
    print()
    print("🎯 実現された価値:")
    print("   - 渋谷区公式サイトからの自動ニュース収集")
    print("   - AIによる多形式要約（速報/解説/やさしい日本語）")
    print("   - 建設的なコメント候補の自動生成")
    print("   - 安全なコメントフィルタリング")
    print("   - コミュニティベースのKPI自動生成")
    print("   - 市民の声を反映したダッシュボード")
    print()
    print("🚀 次のステップ:")
    print("   1. FastAPIサーバー起動: uvicorn app:app --reload")
    print("   2. API仕様確認: http://localhost:8000/docs")
    print("   3. 本番用OpenAI切り替え: USE_OLLAMA=false")
    print("   4. フロントエンド開発: Next.js + Tailwind")

def demo_api_endpoints():
    """APIエンドポイントの使用例"""
    print("\n" + "=" * 60)
    print("📡 APIエンドポイント使用例")
    print("=" * 60)
    
    endpoints = [
        {
            "method": "POST",
            "path": "/scrape-news",
            "description": "渋谷区サイトからニュース収集",
            "example": "curl -X POST http://localhost:8000/scrape-news"
        },
        {
            "method": "GET", 
            "path": "/news",
            "description": "ニュース一覧取得",
            "example": "curl http://localhost:8000/news"
        },
        {
            "method": "GET",
            "path": "/news/0/comment-suggestions",
            "description": "コメント候補取得",
            "example": "curl http://localhost:8000/news/0/comment-suggestions"
        },
        {
            "method": "POST",
            "path": "/comments",
            "description": "コメント投稿（AIフィルタ付き）",
            "example": 'curl -X POST http://localhost:8000/comments -H "Content-Type: application/json" -d \'{"news_id": 0, "user_id": "user1", "content": "防災訓練に参加したいです", "comment_type": "共感"}\''
        },
        {
            "method": "POST",
            "path": "/generate-kpis",
            "description": "KPI自動生成",
            "example": "curl -X POST http://localhost:8000/generate-kpis"
        },
        {
            "method": "GET",
            "path": "/dashboard/summary",
            "description": "ダッシュボードサマリー",
            "example": "curl http://localhost:8000/dashboard/summary"
        }
    ]
    
    for endpoint in endpoints:
        print(f"{endpoint['method']} {endpoint['path']}")
        print(f"   {endpoint['description']}")
        print(f"   例: {endpoint['example']}")
        print()

if __name__ == "__main__":
    demo_full_workflow()
    demo_api_endpoints() 