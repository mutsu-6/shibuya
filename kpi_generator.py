import os
from typing import List, Dict, Optional
from collections import Counter
from dotenv import load_dotenv
import logging
import json
from ai_adapter import ai_adapter

load_dotenv()
logger = logging.getLogger(__name__)

class KPIGenerator:
    """コミュニティの会話からKPIを自動生成するクラス"""
    
    def __init__(self):
        self.ai = ai_adapter
    
    def analyze_community_conversations(self, communities: List[Dict], comments: List[Dict]) -> List[Dict]:
        """コミュニティの会話を分析してKPI候補を生成"""
        kpi_candidates = []
        
        for community in communities:
            # コミュニティ内のコメントを取得
            community_comments = [
                c for c in comments 
                if c.get('user_id') in community.get('members', []) 
                and c.get('news_id') == community.get('news_id')
            ]
            
            if not community_comments:
                continue
            
            # コメントを要約してKPI候補を生成
            conversation_summary = self._summarize_conversation(community_comments)
            kpi_suggestions = self._generate_kpi_from_conversation(
                conversation_summary, 
                community.get('type', ''),
                len(community.get('members', []))
            )
            
            for kpi in kpi_suggestions:
                kpi['community_id'] = community.get('id')
                kpi['community_type'] = community.get('type')
                kpi['member_count'] = len(community.get('members', []))
                kpi['news_id'] = community.get('news_id')
                kpi_candidates.append(kpi)
        
        return kpi_candidates
    
    def _summarize_conversation(self, comments: List[Dict]) -> str:
        """コミュニティ内の会話を要約"""
        try:
            conversation_text = "\n".join([
                f"ユーザー{i+1}: {comment.get('filtered_content', comment.get('content', ''))}"
                for i, comment in enumerate(comments)
            ])
            
            prompt = f"""
以下のコミュニティ内の会話を要約してください。
主要な論点、共通の関心事、提案された解決策などを含めてください。

会話内容:
{conversation_text}

要約（200文字以内）:
"""
            
            messages = [
                {"role": "system", "content": "あなたは市民の意見を整理する専門家です。"},
                {"role": "user", "content": prompt}
            ]
            
            return self.ai.chat_completion(messages, max_tokens=300, temperature=0.3).strip()
            
        except Exception as e:
            logger.error(f"会話要約エラー: {e}")
            return "会話の要約に失敗しました"
    
    def _generate_kpi_from_conversation(self, summary: str, community_type: str, member_count: int) -> List[Dict]:
        """会話要約からKPI候補を生成"""
        try:
            prompt = f"""
以下の市民コミュニティの会話要約から、行政が追跡すべきKPI（重要業績評価指標）を3つ提案してください。

会話要約: {summary}
コミュニティタイプ: {community_type}
参加者数: {member_count}人

各KPIは以下の形式で出力してください：
1. KPI名: [具体的で測定可能な指標名]
   説明: [なぜこのKPIが重要か]
   測定方法: [どのように測定するか]

2. KPI名: [具体的で測定可能な指標名]
   説明: [なぜこのKPIが重要か]
   測定方法: [どのように測定するか]

3. KPI名: [具体的で測定可能な指標名]
   説明: [なぜこのKPIが重要か]
   測定方法: [どのように測定するか]
"""
            
            messages = [
                {"role": "system", "content": "あなたは行政のKPI設計専門家です。"},
                {"role": "user", "content": prompt}
            ]
            
            result = self.ai.chat_completion(messages, max_tokens=600, temperature=0.4)
            return self._parse_kpi_response(result)
            
        except Exception as e:
            logger.error(f"KPI生成エラー: {e}")
            return []
    
    def _parse_kpi_response(self, response: str) -> List[Dict]:
        """AI応答からKPI情報を抽出"""
        kpis = []
        lines = response.strip().split('\n')
        
        current_kpi = {}
        for line in lines:
            line = line.strip()
            if 'KPI名:' in line:
                if current_kpi:  # 前のKPIを保存
                    kpis.append(current_kpi)
                current_kpi = {
                    'name': line.split('KPI名:')[1].strip(),
                    'description': '',
                    'measurement': '',
                    'priority_score': 0,
                    'selected_by_users': 0
                }
            elif '説明:' in line and current_kpi:
                current_kpi['description'] = line.split('説明:')[1].strip()
            elif '測定方法:' in line and current_kpi:
                current_kpi['measurement'] = line.split('測定方法:')[1].strip()
        
        if current_kpi:  # 最後のKPIを保存
            kpis.append(current_kpi)
        
        return kpis
    
    def calculate_kpi_priority(self, kpi_candidates: List[Dict]) -> List[Dict]:
        """KPI候補の優先度を計算"""
        # KPI名でグループ化して重複を統合
        kpi_groups = {}
        
        for kpi in kpi_candidates:
            name = kpi.get('name', '')
            if name not in kpi_groups:
                kpi_groups[name] = {
                    'name': name,
                    'description': kpi.get('description', ''),
                    'measurement': kpi.get('measurement', ''),
                    'community_count': 0,
                    'total_members': 0,
                    'community_types': [],
                    'priority_score': 0,
                    'selected_by_users': 0
                }
            
            kpi_groups[name]['community_count'] += 1
            kpi_groups[name]['total_members'] += kpi.get('member_count', 0)
            kpi_groups[name]['community_types'].append(kpi.get('community_type', ''))
        
        # 優先度スコアを計算
        for kpi in kpi_groups.values():
            # コミュニティ数 × メンバー数の重み付け
            kpi['priority_score'] = kpi['community_count'] * 10 + kpi['total_members']
            kpi['community_types'] = list(set(kpi['community_types']))  # 重複除去
        
        # 優先度順にソート
        sorted_kpis = sorted(kpi_groups.values(), key=lambda x: x['priority_score'], reverse=True)
        
        return sorted_kpis
    
    def generate_dashboard_summary(self, kpis: List[Dict], comments: List[Dict]) -> Dict:
        """ダッシュボード用のサマリーを生成"""
        try:
            # 基本統計
            total_comments = len(comments)
            comment_types = Counter([c.get('comment_type', '') for c in comments])
            
            # 上位KPIの要約
            top_kpis = kpis[:5]  # 上位5つ
            
            summary_text = f"""
コメント総数: {total_comments}件
コメントタイプ別:
- 共感: {comment_types.get('共感', 0)}件
- 質問: {comment_types.get('質問', 0)}件  
- 改善提案: {comment_types.get('改善提案', 0)}件
- 感謝: {comment_types.get('感謝', 0)}件

上位KPI:
{chr(10).join([f"- {kpi['name']} (優先度: {kpi['priority_score']})" for kpi in top_kpis])}
"""
            
            return {
                "total_comments": total_comments,
                "comment_types": dict(comment_types),
                "top_kpis": top_kpis,
                "summary_text": summary_text,
                "generated_at": "2025-09-10T12:00:00"
            }
            
        except Exception as e:
            logger.error(f"ダッシュボードサマリー生成エラー: {e}")
            return {
                "total_comments": len(comments),
                "comment_types": {},
                "top_kpis": [],
                "summary_text": "サマリー生成に失敗しました",
                "generated_at": "2025-09-10T12:00:00"
            }

# 使用例
if __name__ == "__main__":
    generator = KPIGenerator()
    
    # テスト用データ
    test_communities = [
        {
            "id": 0,
            "type": "改善提案",
            "members": ["user1", "user2", "user3"],
            "news_id": 0
        }
    ]
    
    test_comments = [
        {
            "user_id": "user1",
            "content": "駅周辺の授乳スペースが不足しています",
            "comment_type": "改善提案",
            "news_id": 0
        },
        {
            "user_id": "user2", 
            "content": "同感です。子育て支援施設の充実が必要ですね",
            "comment_type": "改善提案",
            "news_id": 0
        }
    ]
    
    kpi_candidates = generator.analyze_community_conversations(test_communities, test_comments)
    prioritized_kpis = generator.calculate_kpi_priority(kpi_candidates)
    dashboard_summary = generator.generate_dashboard_summary(prioritized_kpis, test_comments)
    
    print("=== KPI候補 ===")
    for kpi in prioritized_kpis:
        print(f"名前: {kpi['name']}")
        print(f"説明: {kpi['description']}")
        print(f"優先度: {kpi['priority_score']}")
        print("-" * 30) 