'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, ExternalLink, MessageSquare, RefreshCw } from 'lucide-react';
import { newsApi } from '@/lib/api';
import { NewsItem } from '@/types/api';

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    console.log('🚀 NewsPage: ニュース読み込み開始');
    setLoading(true);
    
    try {
      const data = await newsApi.getNews();
      console.log('✅ NewsPage: データ受信完了');
      console.log('📊 NewsPage: データ長:', data?.length || 0);
      
      setNews(data);
      console.log('💾 NewsPage: setNews() 完了');
      
    } catch (error) {
      console.error('💥 NewsPage: ニュース読み込みエラー:', error);
    } finally {
      setLoading(false);
      console.log('🏁 NewsPage: ニュース読み込み処理完了');
    }
  };

  const handleScrapeNews = async () => {
    console.log('🚀 NewsPage: ニュース収集開始');
    setScraping(true);
    try {
      const result = await newsApi.scrapeNews();
      console.log('📊 NewsPage: ニュース収集結果:', result);
      
      console.log('🔄 NewsPage: ニュース一覧再読み込み開始...');
      await loadNews();
      console.log('✅ NewsPage: ニュース一覧再読み込み完了');
    } catch (error) {
      console.error('💥 NewsPage: ニュース収集エラー:', error);
    } finally {
      setScraping(false);
      console.log('🏁 NewsPage: ニュース収集処理完了');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ニュース</h1>
          <p className="text-gray-600 mt-1">渋谷区の最新ニュースと市民の声</p>
        </div>
        <button
          onClick={handleScrapeNews}
          disabled={scraping}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw size={16} className={scraping ? 'animate-spin' : ''} />
          <span>{scraping ? '収集中...' : '最新ニュース収集'}</span>
        </button>
      </div>

      {/* ニュース一覧 */}
      {(() => {
        console.log('🎨 NewsPage Render: news 長さ:', news?.length || 0);
        
        if (!Array.isArray(news)) {
          console.error('❌ NewsPage Render: news が配列ではありません');
          return (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-red-500">
                データ形式エラー: ニュースデータが正しく読み込まれませんでした。
              </p>
            </div>
          );
        }
        
        return news.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500">
              ニュースがありません。「最新ニュース収集」ボタンを押してニュースを取得してください。
            </p>
          </div>
        ) : (
        <div className="space-y-6">
          {news.map((item, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex-1">
                  {item.title}
                </h2>
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-4 text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                    onClick={() => {
                      console.log('📰 NewsPage: 「元記事」リンククリック');
                      console.log('🔗 NewsPage: 外部URL:', item.url);
                    }}
                  >
                    <ExternalLink size={16} />
                    <span className="text-sm">元記事</span>
                  </a>
                )}
              </div>

              {/* メタ情報 */}
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                {item.date && (
                  <div className="flex items-center space-x-1">
                    <Calendar size={14} />
                    <span>{item.date}</span>
                  </div>
                )}
                {item.source && (
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                    {item.source}
                  </span>
                )}
              </div>

              {/* 要約 */}
              {item.summaries && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {item.summaries.speed && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h4 className="font-medium text-blue-900 text-sm mb-1">
                        速報（30字）
                      </h4>
                      <p className="text-blue-800 text-sm">
                        {item.summaries.speed}
                      </p>
                    </div>
                  )}
                  {item.summaries.explanation && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <h4 className="font-medium text-green-900 text-sm mb-1">
                        解説（120字）
                      </h4>
                      <p className="text-green-800 text-sm">
                        {item.summaries.explanation}
                      </p>
                    </div>
                  )}
                  {item.summaries.easy_japanese && (
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <h4 className="font-medium text-purple-900 text-sm mb-1">
                        やさしい日本語
                      </h4>
                      <p className="text-purple-800 text-sm">
                        {item.summaries.easy_japanese}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* 本文（一部） */}
              <div className="text-gray-700 mb-4">
                <p className="line-clamp-3">
                  {item.content.length > 200 
                    ? `${item.content.substring(0, 200)}...` 
                    : item.content
                  }
                </p>
              </div>

              {/* アクション */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <Link
                  href={`/news/${index}/comments`}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
                  onClick={() => {
                    console.log('📰 NewsPage: 「コメントする」リンククリック');
                    console.log('📍 NewsPage: /news/' + index + '/comments へ遷移');
                    console.log('📄 NewsPage: ニュースタイトル:', item.title);
                  }}
                >
                  <MessageSquare size={16} />
                  <span>コメントする</span>
                </Link>
                
                <Link
                  href={`/news/${index}`}
                  className="text-gray-600 hover:text-gray-800 text-sm transition-colors"
                  onClick={() => {
                    console.log('📰 NewsPage: 「詳細を見る」リンククリック');
                    console.log('📍 NewsPage: /news/' + index + ' へ遷移');
                    console.log('📄 NewsPage: ニュースタイトル:', item.title);
                  }}
                >
                  詳細を見る →
                </Link>
              </div>
            </div>
          ))}
        </div>
        );
      })()}
    </div>
  );
} 