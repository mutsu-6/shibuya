'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, MessageSquare, Calendar, Heart, HelpCircle, Lightbulb, ThumbsUp } from 'lucide-react';
import { communityApi } from '@/lib/api';
import { Community } from '@/types/api';

const commentTypeIcons = {
  empathy: Heart,
  question: HelpCircle,
  improvement: Lightbulb,
  gratitude: ThumbsUp,
};

const commentTypeLabels = {
  empathy: '共感',
  question: '質問',
  improvement: '改善提案',
  gratitude: '感謝',
};

const commentTypeColors = {
  empathy: 'text-red-600 bg-red-50 border-red-200',
  question: 'text-blue-600 bg-blue-50 border-blue-200',
  improvement: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  gratitude: 'text-green-600 bg-green-50 border-green-200',
};

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCommunities();
  }, []);

  const loadCommunities = async () => {
    console.log('👥 CommunitiesPage: コミュニティ一覧読み込み開始');
    try {
      const data = await communityApi.getCommunities();
      console.log('✅ CommunitiesPage: コミュニティ一覧取得成功:', data.length + '件');
      setCommunities(data);
    } catch (error) {
      console.error('❌ CommunitiesPage: コミュニティ読み込みエラー:', error);
    } finally {
      setLoading(false);
      console.log('🏁 CommunitiesPage: コミュニティ読み込み処理完了');
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">コミュニティ</h1>
        <p className="text-gray-600 mt-1">
          同じ関心を持つ市民同士が集まる小規模グループ
        </p>
      </div>

      {/* 統計情報 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">総コミュニティ数</p>
              <p className="text-2xl font-bold text-gray-900">{communities.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <Heart className="h-8 w-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">共感グループ</p>
              <p className="text-2xl font-bold text-gray-900">
                {communities.filter(c => c.comment_type === 'empathy').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <HelpCircle className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">質問グループ</p>
              <p className="text-2xl font-bold text-gray-900">
                {communities.filter(c => c.comment_type === 'question').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <Lightbulb className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">改善提案グループ</p>
              <p className="text-2xl font-bold text-gray-900">
                {communities.filter(c => c.comment_type === 'improvement').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* コミュニティ一覧 */}
      {communities.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            コミュニティがまだありません
          </h3>
          <p className="text-gray-500 mb-4">
            ニュースにコメントを投稿すると、同じタイプのコメントをした人同士で自動的にコミュニティが形成されます。
          </p>
          <Link
            href="/news"
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <MessageSquare size={16} />
            <span>ニュースにコメントする</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.map((community, index) => {
            const Icon = commentTypeIcons[community.comment_type as keyof typeof commentTypeIcons];
            const colorClasses = commentTypeColors[community.comment_type as keyof typeof commentTypeColors];
            const typeLabel = commentTypeLabels[community.comment_type as keyof typeof commentTypeLabels];

            return (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                {/* コミュニティヘッダー */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${colorClasses.split(' ')[1]} ${colorClasses.split(' ')[2]}`}>
                      <Icon size={20} className={colorClasses.split(' ')[0]} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{community.name}</h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorClasses}`}>
                        {typeLabel}グループ
                      </span>
                    </div>
                  </div>
                </div>

                {/* コミュニティ説明 */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {community.description}
                </p>

                {/* メンバー情報 */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-1">
                    <Users size={14} />
                    <span>{community.members.length}人のメンバー</span>
                  </div>
                  {community.created_at && (
                    <div className="flex items-center space-x-1">
                      <Calendar size={14} />
                      <span>{new Date(community.created_at).toLocaleDateString('ja-JP')}</span>
                    </div>
                  )}
                </div>

                {/* メンバーアバター */}
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex -space-x-2">
                    {community.members.slice(0, 4).map((member, memberIndex) => (
                      <div
                        key={memberIndex}
                        className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600"
                      >
                        {member.charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {community.members.length > 4 && (
                      <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-500">
                        +{community.members.length - 4}
                      </div>
                    )}
                  </div>
                </div>

                {/* アクションボタン */}
                <div className="flex space-x-2">
                  <Link
                    href={`/communities/${index}`}
                    className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    onClick={() => {
                      console.log('👥 CommunitiesPage: 「参加する」ボタンクリック');
                      console.log('📍 CommunitiesPage: /communities/' + index + ' へ遷移');
                      console.log('🏷️ CommunitiesPage: コミュニティ名:', community.name);
                    }}
                  >
                    参加する
                  </Link>
                  <Link
                    href={`/communities/${index}`}
                    className="flex-1 border border-gray-300 text-gray-700 text-center py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    onClick={() => {
                      console.log('👥 CommunitiesPage: 「詳細を見る」ボタンクリック');
                      console.log('📍 CommunitiesPage: /communities/' + index + ' へ遷移');
                      console.log('🏷️ CommunitiesPage: コミュニティ名:', community.name);
                    }}
                  >
                    詳細を見る
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* コミュニティ形成の説明 */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-3">
          コミュニティはどのように形成されますか？
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center text-blue-900 font-bold text-xs flex-shrink-0 mt-0.5">
              1
            </div>
            <div>
              <h4 className="font-medium mb-1">コメント投稿</h4>
              <p>ニュースに対して共感、質問、改善提案、感謝のコメントを投稿</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center text-blue-900 font-bold text-xs flex-shrink-0 mt-0.5">
              2
            </div>
            <div>
              <h4 className="font-medium mb-1">自動マッチング</h4>
              <p>同じタイプのコメントをした人同士が自動的にマッチング</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center text-blue-900 font-bold text-xs flex-shrink-0 mt-0.5">
              3
            </div>
            <div>
              <h4 className="font-medium mb-1">小規模グループ形成</h4>
              <p>2-4人の小規模なコミュニティが自動的に形成</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center text-blue-900 font-bold text-xs flex-shrink-0 mt-0.5">
              4
            </div>
            <div>
              <h4 className="font-medium mb-1">AI補助による安心環境</h4>
              <p>AIが会話をサポートし、建設的な議論を促進</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 