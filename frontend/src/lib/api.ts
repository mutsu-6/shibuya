import axios from 'axios';
import {
  NewsItem,
  Comment,
  CommentResponse,
  Community,
  KPI,
  CommentSuggestion,
  DashboardSummary,
  DashboardAnalytics,
  CreateCommentRequest,
  SelectKPIRequest
} from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

console.log('🔧 API Client: Base URL =', API_BASE_URL);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// バックエンドにログを送信する関数
const sendLogToBackend = async (level: 'INFO' | 'ERROR', message: string, data?: unknown) => {
  try {
    await apiClient.post('/frontend-log', {
      level,
      message,
      data
    });
  } catch {
    // ログ送信エラーは無視（無限ループを防ぐため）
  }
};

// リクエストインターセプター
apiClient.interceptors.request.use(
  (config) => {
    console.log('🚀 API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// レスポンスインターセプター
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.status, error.config?.url, error.message);
    return Promise.reject(error);
  }
);

// ニュース関連API
export const newsApi = {
  // ニュース収集
  scrapeNews: async (): Promise<{ message: string; count: number }> => {
    console.log('🚀 API: ニュース収集リクエスト開始');
    await sendLogToBackend('INFO', 'ニュース収集開始');
    
    try {
      const response = await apiClient.post('/scrape-news');
      console.log('📊 API: ニュース収集レスポンス:', response.data);
      
      await sendLogToBackend('INFO', 'ニュース収集完了', {
        status: response.status,
        scraped_count: response.data?.scraped_count,
        total_news: response.data?.total_news,
        message: response.data?.message
      });
      
      return response.data;
    } catch (error) {
      await sendLogToBackend('ERROR', 'ニュース収集エラー', {
        message: (error as Error)?.message,
        status: (error as { response?: { status?: number } })?.response?.status
      });
      throw error;
    }
  },

  // ニュース一覧取得
  getNews: async (): Promise<NewsItem[]> => {
    console.log('🔍 API: ニュース一覧取得開始');
    await sendLogToBackend('INFO', 'ニュース一覧取得開始');
    
    try {
      const response = await apiClient.get('/news');
      console.log('📊 API: レスポンス受信完了');
      console.log('📈 API: HTTPステータス:', response.status);
      
      const newsArray = response.data.news || [];
      console.log('📊 API: 最終返却配列長:', newsArray.length);
      
      await sendLogToBackend('INFO', 'ニュース一覧取得完了', {
        status: response.status,
        newsCount: newsArray.length,
        hasNewsProperty: 'news' in response.data,
        isNewsArray: Array.isArray(response.data.news)
      });
      
      return newsArray;
    } catch (error) {
      console.error('💥 API: ニュース取得エラー:', error);
      await sendLogToBackend('ERROR', 'ニュース取得エラー', {
        message: (error as Error)?.message,
        status: (error as { response?: { status?: number } })?.response?.status,
        statusText: (error as { response?: { statusText?: string } })?.response?.statusText
      });
      return [];
    }
  },

  // コメント候補取得
  getCommentSuggestions: async (newsId: number, commentType?: string): Promise<CommentSuggestion[]> => {
    const params = commentType ? { comment_type: commentType } : {};
    const response = await apiClient.get(`/news/${newsId}/comment-suggestions`, { params });
    return response.data.suggestions || [];
  },
};

// コメント関連API
export const commentApi = {
  // コメント投稿
  createComment: async (comment: CreateCommentRequest): Promise<CommentResponse> => {
    const response = await apiClient.post('/comments', comment);
    return response.data;
  },

  // コメント一覧取得
  getComments: async (newsId?: number): Promise<Comment[]> => {
    const params = newsId ? { news_id: newsId } : {};
    const response = await apiClient.get('/comments', { params });
    return response.data.comments || [];
  },

  // AIチャット
  chatWithAI: async (message: string, newsId: number, conversationHistory: any[]): Promise<string> => {
    const response = await apiClient.post('/chat', {
      message,
      news_id: newsId,
      conversation_history: conversationHistory
    });
    return response.data.ai_response;
  },
};

// コミュニティ関連API
export const communityApi = {
  // コミュニティ一覧取得
  getCommunities: async (): Promise<Community[]> => {
    const response = await apiClient.get('/communities');
    return response.data.communities || [];
  },

  // コミュニティ詳細取得
  getCommunity: async (communityId: number): Promise<Community> => {
    const response = await apiClient.get(`/communities/${communityId}`);
    return response.data;
  },
};

// KPI関連API
export const kpiApi = {
  // KPI生成
  generateKPIs: async (): Promise<{ message: string; kpis: KPI[] }> => {
    const response = await apiClient.post('/generate-kpis');
    return response.data;
  },

  // KPI一覧取得
  getKPIs: async (): Promise<KPI[]> => {
    const response = await apiClient.get('/kpis');
    return response.data.kpis || [];
  },

  // KPI重要度投票
  selectKPI: async (kpiIndex: number, request: SelectKPIRequest): Promise<{ message: string }> => {
    const response = await apiClient.post(`/kpis/${kpiIndex}/select`, request);
    return response.data;
  },
};

// ダッシュボード関連API
export const dashboardApi = {
  // ダッシュボードサマリー取得
  getSummary: async (): Promise<DashboardSummary> => {
    console.log('📊 API: ダッシュボードサマリー取得開始');
    await sendLogToBackend('INFO', 'ダッシュボードサマリー取得開始', { url: `${API_BASE_URL}/dashboard/summary` });
    
    try {
      const response = await apiClient.get('/dashboard/summary');
      console.log('✅ API: ダッシュボードサマリー取得成功:', response.data);
      await sendLogToBackend('INFO', 'ダッシュボードサマリー取得成功', {
        status: response.status,
        totalNews: response.data.total_news,
        totalKpis: response.data.total_kpis
      });
      return response.data;
    } catch (error) {
      console.error('💥 API: ダッシュボードサマリー取得エラー:', error);
      await sendLogToBackend('ERROR', 'ダッシュボードサマリー取得エラー', {
        message: (error as Error)?.message,
        status: (error as { response?: { status?: number } })?.response?.status
      });
      throw error;
    }
  },

  // 詳細分析データ取得
  getAnalytics: async (): Promise<DashboardAnalytics> => {
    const response = await apiClient.get('/dashboard/analytics');
    return response.data;
  },
};

export default apiClient; 