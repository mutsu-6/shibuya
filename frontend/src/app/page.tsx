'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Newspaper, MessageSquare, Users, BarChart3, RefreshCw } from 'lucide-react';
import { dashboardApi, newsApi } from '@/lib/api';
import { DashboardSummary } from '@/types/api';

export default function Home() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);

  const loadSummary = useCallback(async () => {
    console.log('🏠 HomePage: ダッシュボードサマリー読み込み開始');
    try {
      console.log('📡 HomePage: dashboardApi.getSummary() 呼び出し中...');
      const data = await dashboardApi.getSummary();
      console.log('✅ HomePage: サマリーデータ受信:', data);
      console.log('📊 HomePage: total_news:', data?.total_news);
      console.log('📊 HomePage: total_comments:', data?.total_comments);
      console.log('📊 HomePage: total_communities:', data?.total_communities);
      console.log('📊 HomePage: total_kpis:', data?.total_kpis);
      setSummary(data);
      console.log('💾 HomePage: サマリー状態更新完了');
    } catch (error) {
      console.error('💥 HomePage: サマリー読み込みエラー:', error);
      console.error('エラー詳細:', {
        message: (error as Error)?.message,
        status: (error as { response?: { status?: number } })?.response?.status,
        data: (error as { response?: { data?: unknown } })?.response?.data
      });
    } finally {
      setLoading(false);
      console.log('🏁 HomePage: サマリー読み込み処理完了');
    }
  }, []);

  useEffect(() => {
    console.log('🏠 HomePage: useEffect実行 - loadSummary呼び出し');
    loadSummary();
  }, [loadSummary]);

  const handleScrapeNews = async () => {
    console.log('🚀 HomePage: ニュース収集開始');
    setScraping(true);
    try {
      console.log('📡 HomePage: newsApi.scrapeNews() 呼び出し中...');
      const result = await newsApi.scrapeNews();
      console.log('📊 HomePage: ニュース収集結果:', result);
      console.log('📈 HomePage: 収集件数:', (result as { scraped_count?: number })?.scraped_count || 0);
      console.log('📚 HomePage: 総ニュース数:', (result as { total_news?: number })?.total_news || 0);
      
      console.log('🔄 HomePage: サマリー再読み込み開始...');
      await loadSummary(); // サマリーを再読み込み
      console.log('✅ HomePage: サマリー再読み込み完了');
    } catch (error) {
      console.error('💥 HomePage: ニュース収集エラー:', error);
      console.error('エラー詳細:', {
        message: (error as Error)?.message,
        status: (error as { response?: { status?: number } })?.response?.status,
        statusText: (error as { response?: { statusText?: string } })?.response?.statusText,
        data: (error as { response?: { data?: unknown } })?.response?.data
      });
    } finally {
      setScraping(false);
      console.log('🏁 HomePage: ニュース収集処理完了');
    }
  };

  console.log('🏠 HomePage Render: loading =', loading, 'summary =', summary);
  
  if (loading) {
    console.log('🏠 HomePage: ローディング中を表示');
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ヘッダー */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              渋谷共創ダッシュボード
            </h1>
            <p className="text-sm md:text-base text-gray-600 mt-2">
              ニュース収集からコミュニティ形成、KPI生成まで一貫したフローを提供
            </p>
          </div>
          <button
            onClick={handleScrapeNews}
            disabled={scraping}
            className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm md:text-base font-medium w-full md:w-auto"
          >
            <RefreshCw size={18} className={scraping ? 'animate-spin' : ''} />
            <span>{scraping ? 'ニュース収集中...' : 'ニュース収集'}</span>
          </button>
        </div>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Newspaper className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
            </div>
            <div className="ml-3 md:ml-4 min-w-0">
              <p className="text-xs md:text-sm font-medium text-gray-600 truncate">ニュース</p>
              <p className="text-lg md:text-2xl font-bold text-gray-900">
                {summary?.total_news || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <MessageSquare className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
            </div>
            <div className="ml-3 md:ml-4 min-w-0">
              <p className="text-xs md:text-sm font-medium text-gray-600 truncate">コメント</p>
              <p className="text-lg md:text-2xl font-bold text-gray-900">
                {summary?.total_comments || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
            </div>
            <div className="ml-3 md:ml-4 min-w-0">
              <p className="text-xs md:text-sm font-medium text-gray-600 truncate">コミュニティ</p>
              <p className="text-lg md:text-2xl font-bold text-gray-900">
                {summary?.total_communities || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <BarChart3 className="h-5 w-5 md:h-6 md:w-6 text-orange-600" />
            </div>
            <div className="ml-3 md:ml-4 min-w-0">
              <p className="text-xs md:text-sm font-medium text-gray-600 truncate">KPI数</p>
              <p className="text-lg md:text-2xl font-bold text-gray-900">
                {summary?.total_kpis || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 重要KPI */}
      {summary?.top_kpis && summary.top_kpis.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            重要なKPI
          </h2>
          <div className="space-y-4">
            {summary.top_kpis.slice(0, 3).map((kpi, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-medium text-gray-900">{kpi.metric}</h3>
                <p className="text-sm text-gray-600">{kpi.category}</p>
                <p className="text-sm text-gray-500 mt-1">
                  目標値: {kpi.target_value} | 投票数: {kpi.votes}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4">
                    <Link
          href="/dashboard"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          onClick={() => {
            console.log('🏠 HomePage: 「すべてのKPIを見る」リンククリック');
            console.log('📍 HomePage: /dashboard へ遷移');
          }}
        >
          すべてのKPIを見る →
        </Link>
          </div>
        </div>
      )}

      {/* クイックアクション */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <Link
          href="/news"
          className="bg-white rounded-lg shadow-sm p-4 md:p-6 hover:shadow-md transition-shadow active:bg-gray-50"
          onClick={() => {
            console.log('🏠 HomePage: 「ニュース」パネルクリック');
            console.log('📍 HomePage: /news へ遷移');
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:space-x-3 text-center md:text-left">
            <Newspaper className="h-6 w-6 md:h-8 md:w-8 text-blue-600 mx-auto md:mx-0 mb-2 md:mb-0" />
            <div className="min-w-0">
              <h3 className="text-sm md:text-base font-semibold text-gray-900 truncate">ニュース</h3>
              <p className="text-xs md:text-sm text-gray-600 hidden md:block">最新ニュースを確認</p>
            </div>
          </div>
        </Link>

        <Link
          href="/comments"
          className="bg-white rounded-lg shadow-sm p-4 md:p-6 hover:shadow-md transition-shadow active:bg-gray-50"
          onClick={() => {
            console.log('🏠 HomePage: 「コメント」パネルクリック');
            console.log('📍 HomePage: /comments へ遷移');
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:space-x-3 text-center md:text-left">
            <MessageSquare className="h-6 w-6 md:h-8 md:w-8 text-green-600 mx-auto md:mx-0 mb-2 md:mb-0" />
            <div className="min-w-0">
              <h3 className="text-sm md:text-base font-semibold text-gray-900 truncate">コメント</h3>
              <p className="text-xs md:text-sm text-gray-600 hidden md:block">議論に参加する</p>
            </div>
          </div>
        </Link>

        <Link
          href="/communities"
          className="bg-white rounded-lg shadow-sm p-4 md:p-6 hover:shadow-md transition-shadow active:bg-gray-50"
          onClick={() => {
            console.log('🏠 HomePage: 「コミュニティ」パネルクリック');
            console.log('📍 HomePage: /communities へ遷移');
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:space-x-3 text-center md:text-left">
            <Users className="h-6 w-6 md:h-8 md:w-8 text-purple-600 mx-auto md:mx-0 mb-2 md:mb-0" />
            <div className="min-w-0">
              <h3 className="text-sm md:text-base font-semibold text-gray-900 truncate">コミュニティ</h3>
              <p className="text-xs md:text-sm text-gray-600 hidden md:block">グループに参加</p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard"
          className="bg-white rounded-lg shadow-sm p-4 md:p-6 hover:shadow-md transition-shadow active:bg-gray-50"
          onClick={() => {
            console.log('🏠 HomePage: 「ダッシュボード」パネルクリック');
            console.log('📍 HomePage: /dashboard へ遷移');
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:space-x-3 text-center md:text-left">
            <BarChart3 className="h-6 w-6 md:h-8 md:w-8 text-orange-600 mx-auto md:mx-0 mb-2 md:mb-0" />
            <div className="min-w-0">
              <h3 className="text-sm md:text-base font-semibold text-gray-900 truncate">ダッシュボード</h3>
              <p className="text-xs md:text-sm text-gray-600 hidden md:block">分析データを確認</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
