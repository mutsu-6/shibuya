'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Calendar, ExternalLink, MessageSquare, ArrowLeft } from 'lucide-react';
import { newsApi } from '@/lib/api';
import { NewsItem } from '@/types/api';

export default function NewsDetailPage() {
  const params = useParams();
  const newsId = parseInt(params.id as string);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    console.log('📰 NewsDetailPage: ニュース一覧読み込み開始');
    try {
      const data = await newsApi.getNews();
      console.log('✅ NewsDetailPage: ニュース一覧取得成功:', data.length + '件');
      setNews(data);
    } catch (error) {
      console.error('❌ NewsDetailPage: ニュース読み込みエラー:', error);
    } finally {
      setLoading(false);
      console.log('🏁 NewsDetailPage: ニュース読み込み処理完了');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const currentNews = news[newsId];
  if (!currentNews) {
    return (
      <div className="space-y-6">
        <Link
          href="/news"
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
          onClick={() => {
            console.log('📰 NewsDetailPage: 「ニュース一覧に戻る」リンククリック');
            console.log('📍 NewsDetailPage: /news へ遷移');
          }}
        >
          <ArrowLeft size={16} className="mr-1" />
          ニュース一覧に戻る
        </Link>
        
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500">ニュースが見つかりません。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 戻るリンク */}
      <Link
        href="/news"
        className="inline-flex items-center text-blue-600 hover:text-blue-800"
        onClick={() => {
          console.log('📰 NewsDetailPage: 「ニュース一覧に戻る」リンククリック');
          console.log('📍 NewsDetailPage: /news へ遷移');
        }}
      >
        <ArrowLeft size={16} className="mr-1" />
        ニュース一覧に戻る
      </Link>

      {/* ニュース詳細 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold text-gray-900 flex-1">
            {currentNews.title}
          </h1>
          {currentNews.url && (
            <a
              href={currentNews.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-4 text-blue-600 hover:text-blue-800 flex items-center space-x-1"
              onClick={() => {
                console.log('📰 NewsDetailPage: 「元記事」リンククリック');
                console.log('🔗 NewsDetailPage: 外部URL:', currentNews.url);
              }}
            >
              <ExternalLink size={16} />
              <span className="text-sm">元記事</span>
            </a>
          )}
        </div>

        {/* メタ情報 */}
        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
          {currentNews.date && (
            <div className="flex items-center space-x-1">
              <Calendar size={14} />
              <span>{currentNews.date}</span>
            </div>
          )}
          {currentNews.source && (
            <span className="bg-gray-100 px-2 py-1 rounded text-xs">
              {currentNews.source}
            </span>
          )}
        </div>

        {/* 要約 */}
        {currentNews.summaries && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {currentNews.summaries.speed && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">速報（30字）</h3>
                <p className="text-blue-800">{currentNews.summaries.speed}</p>
              </div>
            )}
            {currentNews.summaries.explanation && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-900 mb-2">解説（120字）</h3>
                <p className="text-green-800">{currentNews.summaries.explanation}</p>
              </div>
            )}
            {currentNews.summaries.easy_japanese && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-medium text-purple-900 mb-2">やさしい日本語</h3>
                <p className="text-purple-800">{currentNews.summaries.easy_japanese}</p>
              </div>
            )}
          </div>
        )}

        {/* 本文 */}
        <div className="prose max-w-none mb-6">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {currentNews.content}
          </p>
        </div>

        {/* アクション */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <Link
            href={`/news/${newsId}/comments`}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => {
              console.log('📰 NewsDetailPage: 「コメントする」ボタンクリック');
              console.log('📍 NewsDetailPage: /news/' + newsId + '/comments へ遷移');
            }}
          >
            <MessageSquare size={16} />
            <span>コメントする</span>
          </Link>
        </div>
      </div>
    </div>
  );
} 