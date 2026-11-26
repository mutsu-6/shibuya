// バックエンドAPIの型定義
export interface NewsItem {
  id?: number;
  title: string;
  content: string;
  summaries?: {
    speed?: string;
    explanation?: string;
    easy_japanese?: string;
  };
  url?: string;
  date?: string;
  source?: string;
  created_at?: string;
}

export interface Comment {
  id?: number;
  news_id: number;
  user_id: string;
  content: string;
  comment_type: 'empathy' | 'question' | 'improvement' | 'gratitude';
  filtered_content?: string;
  created_at?: string;
}

export interface CommentResponse {
  status: string;
  comment_id: number;
  filtered_content: string;
  community_matched: boolean;
  ai_response?: string;
}

export interface Community {
  id?: number;
  name: string;
  description: string;
  members: string[];
  comment_type: string;
  created_at?: string;
}

export interface KPI {
  category: string;
  metric: string;
  target_value: string;
  measurement_method: string;
  importance_score: number;
  votes: number;
}

export interface CommentSuggestion {
  type: string;
  text: string;
}

export interface DashboardSummary {
  total_news: number;
  total_comments: number;
  total_communities: number;
  total_issues: number;
  total_kpis: number;
  top_kpis: KPI[];
  comment_types: Record<string, number>;
  summary_text: string;
  generated_at: string;
}

export interface DashboardAnalytics {
  comment_distribution: Record<string, number>;
  community_growth: Array<{date: string; count: number}>;
  engagement_metrics: {
    daily_active_users: number;
    avg_comments_per_news: number;
    community_participation_rate: number;
  };
}

// API Request/Response types
export interface CreateCommentRequest {
  news_id: number;
  user_id: string;
  content: string;
  comment_type: string;
}

export interface SelectKPIRequest {
  importance: number;
} 