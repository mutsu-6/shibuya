import requests
from bs4 import BeautifulSoup
from typing import List, Dict, Optional
from datetime import datetime
import re
import logging

logger = logging.getLogger(__name__)

class ShibuyaNewsScraper:
    """渋谷区公式サイトからニュースを収集するクラス"""
    
    def __init__(self):
        self.base_url = "https://www.city.shibuya.tokyo.jp"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        })
    
    def scrape_news_list(self) -> List[Dict]:
        """新着情報一覧を取得"""
        logger.info("🌐 渋谷区公式サイトへのアクセス開始")
        # デバッグポイント: スクレイピング開始時
        import pdb; pdb.set_trace() if False else None  # デバッグ用（必要時にTrueに変更）
        try:
            # 新着情報ページのURL（推測）
            news_url = f"{self.base_url}/"
            logger.info(f"📡 アクセス先URL: {news_url}")
            
            response = self.session.get(news_url, timeout=10)
            logger.info(f"📊 HTTPレスポンス: {response.status_code}")
            response.raise_for_status()
            
            logger.info(f"📄 レスポンスサイズ: {len(response.content)} bytes")
            soup = BeautifulSoup(response.content, 'html.parser')
            news_items = []
            
            # 新着情報のセクションを探す
            logger.info("🔍 新着情報セクションを検索中...")
            news_sections = soup.find_all(['div', 'section'], class_=re.compile(r'news|info|新着'))
            logger.info(f"📋 見つかったニュースセクション数: {len(news_sections)}")
            
            total_links = 0
            for i, section in enumerate(news_sections):
                logger.info(f"📂 セクション {i+1}/{len(news_sections)} を処理中")
                # リンクとタイトルを抽出
                links = section.find_all('a', href=True)
                total_links += len(links)
                logger.info(f"🔗 セクション内リンク数: {len(links)}")
                
                for j, link in enumerate(links):
                    title = self._clean_text(link.get_text())
                    logger.info(f"📰 リンク {j+1}: タイトル='{title}' (長さ: {len(title) if title else 0})")
                    
                    if title and len(title) > 10:  # 意味のあるタイトルのみ
                        href = link['href']
                        if href.startswith('/'):
                            href = self.base_url + href
                        
                        # 日付を抽出（可能であれば）
                        date_text = self._extract_date(link.parent)
                        logger.info(f"✅ 有効なニュース発見: {title[:50]}...")
                        
                        news_items.append({
                            'title': title,
                            'url': href,
                            'date': date_text,
                            'source': '渋谷区公式サイト',
                            'scraped_at': datetime.now().isoformat()
                        })
            
            logger.info(f"📊 総リンク数: {total_links}, 有効ニュース数: {len(news_items)}")
            result = news_items[:10]  # 最新10件を返す
            logger.info(f"🎯 最終返却数: {len(result)}件")
            return result
            
        except Exception as e:
            logger.error(f"💥 ニュース収集エラー: {e}")
            logger.error(f"エラータイプ: {type(e).__name__}")
            import traceback
            logger.error(f"スタックトレース: {traceback.format_exc()}")
            return []
    
    def scrape_news_detail(self, url: str) -> Optional[Dict]:
        """個別ニュースの詳細を取得"""
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # メインコンテンツを抽出
            content_selectors = [
                'main', '.content', '.main-content', 
                'article', '.article', '#content'
            ]
            
            content = ""
            for selector in content_selectors:
                element = soup.select_one(selector)
                if element:
                    content = self._clean_text(element.get_text())
                    break
            
            if not content:
                # フォールバック：body全体から抽出
                body = soup.find('body')
                if body:
                    content = self._clean_text(body.get_text())
            
            return {
                'url': url,
                'content': content[:1000],  # 最初の1000文字
                'scraped_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"詳細取得エラー {url}: {e}")
            return None
    
    def _clean_text(self, text: str) -> str:
        """テキストをクリーニング"""
        if not text:
            return ""
        
        # 改行や空白を正規化
        text = re.sub(r'\s+', ' ', text.strip())
        # 不要な文字を除去
        text = re.sub(r'[^\w\s\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3400-\u4DBF、。！？]', '', text)
        
        return text
    
    def _extract_date(self, element) -> Optional[str]:
        """要素から日付を抽出"""
        if not element:
            return None
            
        text = element.get_text()
        # 日付パターンを検索
        date_patterns = [
            r'(\d{4})年(\d{1,2})月(\d{1,2})日',
            r'(\d{4})/(\d{1,2})/(\d{1,2})',
            r'(\d{4})-(\d{1,2})-(\d{1,2})'
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, text)
            if match:
                year, month, day = match.groups()
                return f"{year}-{month.zfill(2)}-{day.zfill(2)}"
        
        return None

# 使用例
if __name__ == "__main__":
    scraper = ShibuyaNewsScraper()
    news_list = scraper.scrape_news_list()
    
    for news in news_list:
        print(f"タイトル: {news['title']}")
        print(f"URL: {news['url']}")
        print(f"日付: {news.get('date', '不明')}")
        print("-" * 50) 