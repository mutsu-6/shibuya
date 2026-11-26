'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageSquare, Calendar, User, Heart, HelpCircle, Lightbulb, ThumbsUp } from 'lucide-react';
import { commentApi } from '@/lib/api';
import { Comment } from '@/types/api';

const commentTypeIcons = {
  empathy: Heart,
  question: HelpCircle,
  improvement: Lightbulb,
  gratitude: ThumbsUp,
  opinion: MessageSquare,
};

const commentTypeLabels = {
  empathy: '共感',
  question: '質問',
  improvement: '改善提案',
  gratitude: '感謝',
  opinion: '意見',
};

const commentTypeColors = {
  empathy: 'text-red-600 bg-red-50 border-red-200',
  question: 'text-blue-600 bg-blue-50 border-blue-200',
  improvement: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  gratitude: 'text-green-600 bg-green-50 border-green-200',
  opinion: 'text-gray-600 bg-gray-50 border-gray-200',
};

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    console.log('💬 CommentsPage: コメント一覧読み込み開始');
    try {
      const data = await commentApi.getComments();
      console.log('✅ CommentsPage: コメント一覧取得成功:', data.length + '件');
      setComments(data);
    } catch (error) {
      console.error('❌ CommentsPage: コメント読み込みエラー:', error);
    } finally {
      setLoading(false);
      console.log('🏁 CommentsPage: コメント読み込み処理完了');
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
        <h1 className="text-3xl font-bold text-gray-900">コメント一覧</h1>
        <p className="text-gray-600 mt-1">
          全てのニュースに投稿されたコメントを確認できます
        </p>
      </div>

      {/* 統計情報 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <MessageSquare className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">総コメント数</p>
              <p className="text-2xl font-bold text-gray-900">{comments.length}</p>
            </div>
          </div>
        </div>

        {Object.entries(commentTypeLabels).map(([type, label]) => {
          const Icon = commentTypeIcons[type as keyof typeof commentTypeIcons];
          const count = comments.filter(c => c.comment_type === type).length;
          
          return (
            <div key={type} className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center">
                <Icon className="h-8 w-8 text-gray-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">{label}</p>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* コメント一覧 */}
      {comments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500">
            まだコメントがありません。ニュースページでコメントを投稿してみましょう！
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment, index) => {
            const Icon = commentTypeIcons[comment.comment_type as keyof typeof commentTypeIcons];
            const colorClass = commentTypeColors[comment.comment_type as keyof typeof commentTypeColors];
            const typeLabel = commentTypeLabels[comment.comment_type as keyof typeof commentTypeLabels];
            
            return (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-600">
                      {comment.user_id?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{comment.user_id || 'ユーザー'}</p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Calendar size={14} />
                                                 <span>{comment.created_at ? new Date(comment.created_at).toLocaleDateString('ja-JP') : '日付不明'}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
                    <Icon size={12} className="mr-1" />
                    {typeLabel}
                  </span>
                </div>

                <p className="text-gray-700 mb-4 leading-relaxed">
                  {comment.content}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <Link
                    href={`/news/${comment.news_id}/comments`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    onClick={() => {
                      console.log('💬 CommentsPage: 「ニュースを見る」リンククリック');
                      console.log('📍 CommentsPage: /news/' + comment.news_id + '/comments へ遷移');
                    }}
                  >
                    ニュースを見る →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 