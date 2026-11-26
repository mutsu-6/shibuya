'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Calendar, ExternalLink, Send, Lightbulb, Heart, HelpCircle, ThumbsUp } from 'lucide-react';
import { newsApi, commentApi } from '@/lib/api';
import { NewsItem, Comment, CommentSuggestion } from '@/types/api';

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
  empathy: 'text-red-600 bg-red-50',
  question: 'text-blue-600 bg-blue-50',
  improvement: 'text-yellow-600 bg-yellow-50',
  gratitude: 'text-green-600 bg-green-50',
};

export default function NewsCommentsPage() {
  const params = useParams();
  const newsId = parseInt(params.id as string);
  
  const [news, setNews] = useState<NewsItem[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [suggestions, setSuggestions] = useState<CommentSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [selectedType, setSelectedType] = useState<string>('empathy');
  const [userId] = useState(`user_${Math.random().toString(36).substr(2, 9)}`);
  const [typedSuggestions, setTypedSuggestions] = useState<CommentSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [chatMode, setChatMode] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const [chatMessage, setChatMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [newsData, commentsData, suggestionsData] = await Promise.all([
        newsApi.getNews(),
        commentApi.getComments(newsId),
        newsApi.getCommentSuggestions(newsId),
      ]);
      
      setNews(newsData);
      setComments(commentsData);
      setSuggestions(suggestionsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }, [newsId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTypeSelection = async (type: string) => {
    console.log('🎯 CommentsPage: コメントタイプ選択:', type);
    setSelectedType(type);
    setLoadingSuggestions(true);
    setShowSuggestions(true);
    
    try {
      console.log('🤖 CommentsPage: AI候補生成開始');
      const suggestionsData = await newsApi.getCommentSuggestions(newsId, type);
      console.log('✅ CommentsPage: AI候補生成完了:', suggestionsData);
      setTypedSuggestions(suggestionsData);
    } catch (error) {
      console.error('❌ CommentsPage: AI候補生成エラー:', error);
      setTypedSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleSuggestionSelect = (suggestion: CommentSuggestion) => {
    console.log('📝 CommentsPage: AI候補選択:', suggestion);
    setNewComment(suggestion.text);
    setShowSuggestions(false);
  };

  const handleChatSend = async () => {
    if (!chatMessage.trim()) return;
    
    setChatLoading(true);
    try {
      console.log('💬 CommentsPage: AIチャット送信:', chatMessage);
      
      const aiResponse = await commentApi.chatWithAI(chatMessage, newsId, conversationHistory);
      
      const newMessages = [
        ...conversationHistory,
        { role: 'user', message: chatMessage, timestamp: new Date().toISOString() },
        { role: 'ai', message: aiResponse, timestamp: new Date().toISOString() }
      ];
      
      setConversationHistory(newMessages);
      setChatMessage('');
      console.log('✅ CommentsPage: AIチャット応答受信');
    } catch (error) {
      console.error('❌ CommentsPage: AIチャットエラー:', error);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    console.log('📝 CommentsPage: コメント投稿開始');
    console.log('📄 CommentsPage: コメント内容:', newComment.trim());
    console.log('🏷️ CommentsPage: コメントタイプ:', selectedType);
    console.log('📰 CommentsPage: ニュースID:', newsId);

    setSubmitting(true);
    try {
      const response = await commentApi.createComment({
        news_id: newsId,
        user_id: userId,
        content: newComment,
        comment_type: selectedType,
      });
      
      console.log('✅ CommentsPage: コメント投稿成功');
      
      // AIチャットモードに切り替え
      if (response.ai_response) {
        const initialConversation = [
          { role: 'user', message: newComment, timestamp: new Date().toISOString() },
          { role: 'ai', message: response.ai_response, timestamp: new Date().toISOString() }
        ];
        setConversationHistory(initialConversation);
        setChatMode(true);
        console.log('🤖 CommentsPage: AIチャットモード開始');
      }
      
      setNewComment('');
      await loadData(); // コメントを再読み込み
    } catch (error) {
      console.error('❌ CommentsPage: コメント投稿エラー:', error);
    } finally {
      setSubmitting(false);
      console.log('🏁 CommentsPage: コメント投稿処理完了');
    }
  };

  const handleUseSuggestion = (suggestion: CommentSuggestion) => {
    console.log('💡 CommentsPage: AI提案コメント使用');
    console.log('📝 CommentsPage: 提案タイプ:', suggestion.type);
    console.log('📄 CommentsPage: 提案内容:', suggestion.text);
    setNewComment(suggestion.text);
    setSelectedType(suggestion.type);
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
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <p className="text-gray-500">ニュースが見つかりません。</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
                console.log('📄 CommentsPage: 「元記事」リンククリック');
                console.log('🔗 CommentsPage: 外部URL:', currentNews.url);
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
        <div className="prose max-w-none">
          <p className="text-gray-700 leading-relaxed">{currentNews.content}</p>
        </div>
      </div>

      {/* AIチャット / コメント投稿フォーム */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {chatMode ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">AIとの対話</h2>
              <button
                onClick={() => setChatMode(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                コメント投稿に戻る
              </button>
            </div>
            
            {/* 会話履歴 */}
            <div className="max-h-96 overflow-y-auto mb-4 space-y-3">
              {conversationHistory.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {new Date(msg.timestamp).toLocaleTimeString('ja-JP', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* チャット入力 */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleChatSend()}
                placeholder="AIと対話を続ける..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={chatLoading}
              />
              <button
                onClick={handleChatSend}
                disabled={chatLoading || !chatMessage.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {chatLoading ? '...' : '送信'}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">コメントを投稿</h2>
        
        {/* AI候補選択 */}
        {showSuggestions && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              {commentTypeLabels[selectedType as keyof typeof commentTypeLabels]}のコメント候補
            </h3>
            {loadingSuggestions ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">AI候補を生成中...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {typedSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionSelect(suggestion)}
                    className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-700 flex-1">{suggestion.text}</p>
                      <span className="text-xs text-blue-600 ml-2">選択</span>
                    </div>
                  </button>
                ))}
                <button
                  onClick={() => setShowSuggestions(false)}
                  className="w-full text-center py-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  候補を閉じる
                </button>
              </div>
            )}
          </div>
        )}

            {/* コメント投稿フォーム */}
            <form onSubmit={handleSubmitComment} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              コメントタイプ
            </label>
            <div className="flex space-x-2">
              {Object.entries(commentTypeLabels).map(([type, label]) => {
                const Icon = commentTypeIcons[type as keyof typeof commentTypeIcons];
                const isSelected = selectedType === type;
                
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleTypeSelection(type)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="text-sm">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              コメント内容
            </label>
            <textarea
              id="comment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="あなたの意見や感想を入力してください..."
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={16} />
            <span>{submitting ? '投稿中...' : 'コメント投稿'}</span>
          </button>
        </form>
          </div>
        )}
      </div>

      {/* コメント一覧 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          コメント ({comments.length})
        </h2>
        
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            まだコメントがありません。最初のコメントを投稿してみましょう！
          </p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment, index) => {
              const Icon = commentTypeIcons[comment.comment_type as keyof typeof commentTypeIcons];
              const colorClass = commentTypeColors[comment.comment_type as keyof typeof commentTypeColors];
              
              return (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon size={16} className={colorClass.split(' ')[0]} />
                    <span className={`text-xs px-2 py-1 rounded ${colorClass}`}>
                      {commentTypeLabels[comment.comment_type as keyof typeof commentTypeLabels]}
                    </span>
                    <span className="text-sm text-gray-500">
                      {comment.user_id}
                    </span>
                    {comment.created_at && (
                      <span className="text-xs text-gray-400">
                        {new Date(comment.created_at).toLocaleString('ja-JP')}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700">
                    {comment.filtered_content || comment.content}
                  </p>
                  {comment.filtered_content && comment.filtered_content !== comment.content && (
                    <p className="text-xs text-gray-500 mt-1">
                      ※ AIにより表現が調整されました
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 