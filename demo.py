#!/usr/bin/env python3
"""
渋谷共創ダッシュボードのデモスクリプト
OpenAI APIキーなしでも基本機能をテストできます
"""

import json
from datetime import datetime
from news_scraper import ShibuyaNewsScraper

def demo_news_scraping():
    """ニュース収集のデモ"""
    print("=== 渋谷区ニュース収集デモ ===")
    
    scraper = ShibuyaNewsScraper()
    try:
        news_list = scraper.scrape_news_list()
        
        if news_list:
            print(f"✅ {len(news_list)}件のニュースを収集しました")
            for i, news in enumerate(news_list[:3]):  # 最初の3件を表示
                print(f"\n{i+1}. {news['title']}")
                print(f"   URL: {news['url']}")
                print(f"   日付: {news.get('date', '不明')}")
        else:
            print("❌ ニュースの収集に失敗しました")
            
    except Exception as e:
        print(f"❌ エラー: {e}")

def demo_data_structure():
    """データ構造のデモ"""
    print("\n=== データ構造デモ ===")
    
    # サンプルデータ
    sample_news = {
        "title": "渋谷区総合防災訓練を実施",
        "content": "渋谷区では、災害に備えるため区内11地区で総合防災訓練を実施します。",
        "summaries": {
            "速報": "渋谷区で防災訓練実施",
            "解説": "渋谷区が災害対策として区内11地区で総合防災訓練を開催。市民参加を呼びかけています。",
            "やさしい日本語": "渋谷区で災害の練習をします。みなさん参加してください。"
        },
        "url": "https://www.city.shibuya.tokyo.jp/news/example",
        "date": "2025-09-10",
        "source": "渋谷区公式サイト"
    }
    
    sample_comments = [
        {
            "news_id": 0,
            "user_id": "user1",
            "content": "防災訓練は大切ですね",
            "comment_type": "共感",
            "filtered_content": "防災訓練は大切ですね"
        },
        {
            "news_id": 0,
            "user_id": "user2", 
            "content": "参加方法を教えてください",
            "comment_type": "質問",
            "filtered_content": "参加方法を教えてください"
        }
    ]
    
    sample_community = {
        "id": 0,
        "type": "共感",
        "members": ["user1", "user3", "user4"],
        "news_id": 0,
        "created_at": datetime.now().isoformat()
    }
    
    sample_kpi = {
        "name": "防災訓練参加率",
        "description": "市民の防災意識向上を測る重要な指標",
        "measurement": "参加者数 / 対象人口 × 100",
        "priority_score": 25,
        "selected_by_users": 3,
        "community_types": ["共感", "改善提案"]
    }
    
    print("📰 ニュースデータ:")
    print(json.dumps(sample_news, ensure_ascii=False, indent=2))
    
    print("\n💬 コメントデータ:")
    print(json.dumps(sample_comments, ensure_ascii=False, indent=2))
    
    print("\n👥 コミュニティデータ:")
    print(json.dumps(sample_community, ensure_ascii=False, indent=2))
    
    print("\n📊 KPIデータ:")
    print(json.dumps(sample_kpi, ensure_ascii=False, indent=2))

def demo_api_flow():
    """APIフローのデモ"""
    print("\n=== APIフローデモ ===")
    
    flow_steps = [
        "1. POST /scrape-news - 渋谷区サイトからニュース収集",
        "2. GET /news - ニュース一覧を取得",
        "3. GET /news/0/comment-suggestions - コメント候補を取得",
        "4. POST /comments - ユーザーがコメント投稿",
        "5. 自動的にコミュニティマッチング実行",
        "6. POST /generate-kpis - コミュニティ会話からKPI生成",
        "7. GET /dashboard/summary - ダッシュボード統計を確認",
        "8. POST /kpis/0/select - ユーザーがKPIを重要だと選択"
    ]
    
    for step in flow_steps:
        print(f"  {step}")
    
    print("\n🎯 期待される結果:")
    print("  - ニュース → コメント → コミュニティ → KPI の自然な流れ")
    print("  - AIによる安全なコメント環境")
    print("  - 市民の声から生まれる実用的なKPI")
    print("  - 行政が活用できるダッシュボード")

def main():
    """メイン関数"""
    print("🏢 渋谷共創ダッシュボード - デモンストレーション")
    print("=" * 50)
    
    demo_news_scraping()
    demo_data_structure()
    demo_api_flow()
    
    print("\n" + "=" * 50)
    print("✨ デモ完了！")
    print("📝 次のステップ:")
    print("  1. OpenAI APIキーを設定して AI機能を有効化")
    print("  2. uvicorn app:app --reload でサーバー起動")
    print("  3. http://localhost:8000/docs でAPI仕様を確認")
    print("  4. フロントエンド開発 (Next.js + Tailwind)")

if __name__ == "__main__":
    main() 