'use client';

import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Users, MessageSquare, Target, Vote, Plus } from 'lucide-react';
import { dashboardApi, kpiApi } from '@/lib/api';
import { DashboardSummary, DashboardAnalytics, KPI } from '@/types/api';

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [summaryData, analyticsData, kpiData] = await Promise.all([
        dashboardApi.getSummary(),
        dashboardApi.getAnalytics(),
        kpiApi.getKPIs(),
      ]);
      
      setSummary(summaryData);
      setAnalytics(analyticsData);
      setKpis(kpiData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateKPIs = async () => {
    console.log('🎯 DashboardPage: KPI生成開始');
    setGenerating(true);
    try {
      await kpiApi.generateKPIs();
      console.log('✅ DashboardPage: KPI生成成功');
      await loadDashboardData(); // データを再読み込み
    } catch (error) {
      console.error('❌ DashboardPage: KPI生成エラー:', error);
    } finally {
      setGenerating(false);
      console.log('🏁 DashboardPage: KPI生成処理完了');
    }
  };

  const handleVoteKPI = async (kpiIndex: number, importance: number) => {
    console.log('🗳️ DashboardPage: KPI投票開始');
    console.log('📊 DashboardPage: KPIインデックス:', kpiIndex);
    console.log('⭐ DashboardPage: 重要度:', importance);
    try {
      await kpiApi.selectKPI(kpiIndex, { importance });
      console.log('✅ DashboardPage: KPI投票成功');
      await loadDashboardData(); // データを再読み込み
    } catch (error) {
      console.error('❌ DashboardPage: KPI投票エラー:', error);
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
          <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
          <p className="text-gray-600 mt-1">
            コミュニティの活動状況とKPI分析
          </p>
        </div>
        <button
          onClick={handleGenerateKPIs}
          disabled={generating}
          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Plus size={16} className={generating ? 'animate-spin' : ''} />
          <span>{generating ? 'KPI生成中...' : 'KPI生成'}</span>
        </button>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">総ニュース数</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary?.total_news || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <MessageSquare className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">総コメント数</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary?.total_comments || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">コミュニティ数</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary?.total_communities || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">KPI数</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary?.total_kpis || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* エンゲージメント指標 */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* コメント分布 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              コメントタイプ分布
            </h2>
            <div className="space-y-3">
              {Object.entries(analytics.comment_distribution).map(([type, count]) => {
                const total = Object.values(analytics.comment_distribution).reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                
                const typeLabels: Record<string, string> = {
                  empathy: '共感',
                  question: '質問',
                  improvement: '改善提案',
                  gratitude: '感謝',
                };

                const typeColors: Record<string, string> = {
                  empathy: 'bg-red-500',
                  question: 'bg-blue-500',
                  improvement: 'bg-yellow-500',
                  gratitude: 'bg-green-500',
                };

                return (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${typeColors[type] || 'bg-gray-500'}`}></div>
                      <span className="text-sm font-medium text-gray-700">
                        {typeLabels[type] || type}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${typeColors[type] || 'bg-gray-500'}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">
                        {count} ({percentage}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* エンゲージメント指標 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              エンゲージメント指標
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">
                  デイリーアクティブユーザー
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {analytics.engagement_metrics.daily_active_users}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">
                  ニュースあたり平均コメント数
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {analytics.engagement_metrics.avg_comments_per_news.toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">
                  コミュニティ参加率
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {(analytics.engagement_metrics.community_participation_rate * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI一覧 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            重要業績指標 (KPI)
          </h2>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Target size={16} />
            <span>{kpis.length}個のKPI</span>
          </div>
        </div>

        {kpis.length === 0 ? (
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              KPIがまだありません
            </h3>
            <p className="text-gray-500 mb-4">
              コミュニティの会話からKPIを自動生成してみましょう。
            </p>
            <button
              onClick={handleGenerateKPIs}
              disabled={generating}
              className="inline-flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus size={16} className={generating ? 'animate-spin' : ''} />
              <span>{generating ? 'KPI生成中...' : 'KPI生成'}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {kpis.map((kpi, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                        {kpi.category}
                      </span>
                      <span className="text-sm text-gray-500">
                        重要度: {kpi.importance_score.toFixed(1)}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {kpi.metric}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      目標値: {kpi.target_value}
                    </p>
                    <p className="text-sm text-gray-500">
                      測定方法: {kpi.measurement_method}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Vote size={14} />
                      <span>{kpi.votes}票</span>
                    </div>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => handleVoteKPI(index, rating)}
                          className="w-6 h-6 rounded-full border border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center text-xs font-medium"
                        >
                          {rating}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* 重要度バー */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(kpi.importance_score * 20, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 使用方法の説明 */}
      <div className="bg-green-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-green-900 mb-3">
          ダッシュボードの使い方
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-green-200 flex items-center justify-center text-green-900 font-bold text-xs flex-shrink-0 mt-0.5">
              1
            </div>
            <div>
              <h4 className="font-medium mb-1">データ収集</h4>
              <p>コミュニティの会話やコメントから自動的にデータを収集</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-green-200 flex items-center justify-center text-green-900 font-bold text-xs flex-shrink-0 mt-0.5">
              2
            </div>
            <div>
              <h4 className="font-medium mb-1">KPI自動生成</h4>
              <p>AIが市民の声から重要な指標を自動的に抽出・提案</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-green-200 flex items-center justify-center text-green-900 font-bold text-xs flex-shrink-0 mt-0.5">
              3
            </div>
            <div>
              <h4 className="font-medium mb-1">市民投票</h4>
              <p>生成されたKPIに対して市民が重要度を投票</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-green-200 flex items-center justify-center text-green-900 font-bold text-xs flex-shrink-0 mt-0.5">
              4
            </div>
            <div>
              <h4 className="font-medium mb-1">優先順位決定</h4>
              <p>投票結果に基づいて重要なKPIを優先的に表示</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 