import os
from typing import Dict, List, Optional
from dotenv import load_dotenv
import logging
from ai_adapter import ai_adapter

load_dotenv()
logger = logging.getLogger(__name__)

class NewsSummarizer:
    """ニュース要約AI機能"""
    
    def __init__(self):
        self.ai = ai_adapter
        
    def summarize_news(self, title: str, content: str) -> Dict[str, str]:
        """ニュースを複数の形式で要約"""
        try:
            prompt = f"""
以下の渋谷区のニュースを、3つの異なる形式で要約してください：

タイトル: {title}
内容: {content}

要求する要約形式：
1. 速報（30文字以内）: 最も重要なポイントを簡潔に
2. 解説（120文字以内）: 詳細な説明を含む要約
3. やさしい日本語（100文字以内）: 誰でも理解しやすい表現で

出力形式：
速報: [30文字以内の要約]
解説: [120文字以内の要約]
やさしい日本語: [100文字以内の要約]
"""
            
            messages = [
                {"role": "system", "content": "あなたは渋谷区の情報を市民に分かりやすく伝える専門家です。"},
                {"role": "user", "content": prompt}
            ]
            
            result = self.ai.chat_completion(messages, max_tokens=500, temperature=0.3)
            return self._parse_summary_response(result)
            
        except Exception as e:
            logger.error(f"要約エラー: {e}")
            return {
                "速報": title[:30],
                "解説": content[:120],
                "やさしい日本語": title[:100]
            }
    
    def _parse_summary_response(self, response: str) -> Dict[str, str]:
        """AI応答を解析して構造化データに変換"""
        summaries = {
            "速報": "",
            "解説": "",
            "やさしい日本語": ""
        }
        
        # セクション分割による解析
        sections = response.strip().split('\n\n')
        current_section = ""
        
        for section in sections:
            section = section.strip()
            if not section:
                continue
                
            lines = section.split('\n')
            header = lines[0].strip()
            
            # ヘッダーから種類を判定
            if '速報' in header:
                current_section = "速報"
                # ヘッダー行に内容が含まれている場合
                if len(lines) > 1:
                    summaries[current_section] = '\n'.join(lines[1:]).strip()
                else:
                    # ヘッダーの後に内容がある場合
                    content = header.replace('**速報**', '').replace('速報', '').strip()
                    if content:
                        summaries[current_section] = content
            elif '解説' in header:
                current_section = "解説"
                if len(lines) > 1:
                    summaries[current_section] = '\n'.join(lines[1:]).strip()
                else:
                    content = header.replace('**解説**', '').replace('解説', '').strip()
                    if content:
                        summaries[current_section] = content
            elif 'やさしい日本語' in header:
                current_section = "やさしい日本語"
                if len(lines) > 1:
                    summaries[current_section] = '\n'.join(lines[1:]).strip()
                else:
                    content = header.replace('**やさしい日本語**', '').replace('やさしい日本語', '').strip()
                    if content:
                        summaries[current_section] = content
            elif current_section and not any(key in header for key in ['速報', '解説', 'やさしい日本語']):
                # 継続する内容
                if summaries[current_section]:
                    summaries[current_section] += ' ' + section
                else:
                    summaries[current_section] = section
        
        # 単一行での解析もフォールバック
        if not any(summaries.values()):
            lines = response.strip().split('\n')
            for line in lines:
                line = line.strip()
                if '速報' in line and ('：' in line or ':' in line):
                    if '：' in line:
                        summaries["速報"] = line.split('：')[1].strip()
                    else:
                        summaries["速報"] = line.split(':')[1].strip()
                elif '解説' in line and ('：' in line or ':' in line):
                    if '：' in line:
                        summaries["解説"] = line.split('：')[1].strip()
                    else:
                        summaries["解説"] = line.split(':')[1].strip()
                elif 'やさしい日本語' in line and ('：' in line or ':' in line):
                    if '：' in line:
                        summaries["やさしい日本語"] = line.split('：')[1].strip()
                    else:
                        summaries["やさしい日本語"] = line.split(':')[1].strip()
        
        return summaries
    
    def generate_comment_suggestions(self, news_title: str, news_summary: str) -> List[Dict[str, str]]:
        """ニュースに対するコメント候補を生成"""
        try:
            prompt = f"""
以下のニュースに対して、市民が書きそうな建設的なコメントの候補を4つ生成してください。
それぞれ異なる視点（共感、質問、改善提案、感謝）で作成してください。

ニュース: {news_title}
要約: {news_summary}

各コメントは以下の形式で出力してください：
1. 共感: [共感を示すコメント]
2. 質問: [詳細を聞く質問]
3. 改善提案: [建設的な提案]
4. 感謝: [感謝や応援のコメント]

コメントは50文字以内で、丁寧で建設的な表現にしてください。
"""
            
            messages = [
                {"role": "system", "content": "あなたは市民の声を建設的で安全な表現に導く専門家です。"},
                {"role": "user", "content": prompt}
            ]
            
            result = self.ai.chat_completion(messages, max_tokens=400, temperature=0.7)
            return self._parse_comment_suggestions(result)
            
        except Exception as e:
            logger.error(f"コメント候補生成エラー: {e}")
            return [
                {"type": "共感", "text": "このニュースに関心があります"},
                {"type": "質問", "text": "詳細を教えてください"},
                {"type": "改善提案", "text": "より良い方法があるかもしれません"},
                {"type": "感謝", "text": "情報をありがとうございます"}
            ]
    
    def _parse_comment_suggestions(self, response: str) -> List[Dict[str, str]]:
        """コメント候補の応答を解析"""
        suggestions = []
        lines = response.strip().split('\n')
        
        for line in lines:
            if '共感:' in line:
                suggestions.append({"type": "共感", "text": line.split('共感:')[1].strip()})
            elif '質問:' in line:
                suggestions.append({"type": "質問", "text": line.split('質問:')[1].strip()})
            elif '改善提案:' in line:
                suggestions.append({"type": "改善提案", "text": line.split('改善提案:')[1].strip()})
            elif '感謝:' in line:
                suggestions.append({"type": "感謝", "text": line.split('感謝:')[1].strip()})
        
        return suggestions
    
    def generate_typed_comment_suggestions(self, news_title: str, news_summary: str, comment_type: str) -> List[Dict[str, str]]:
        """特定のタイプのコメント候補を3つ生成"""
        try:
            type_prompts = {
                "empathy": "共感や理解を示すコメント",
                "question": "詳細や背景について質問するコメント", 
                "improvement": "建設的な改善提案や代案を示すコメント",
                "gratitude": "感謝や応援を示すコメント"
            }
            
            type_names = {
                "empathy": "共感",
                "question": "質問",
                "improvement": "改善提案", 
                "gratitude": "感謝"
            }
            
            prompt_description = type_prompts.get(comment_type, "建設的なコメント")
            type_name = type_names.get(comment_type, comment_type)
            
            prompt = f"""
以下のニュースに対して、{prompt_description}を3つ生成してください。
それぞれ異なる視点や表現で、市民が実際に書きそうな自然なコメントにしてください。

ニュース: {news_title}
要約: {news_summary}

以下の形式で出力してください：
1. {type_name}: [コメント1]
2. {type_name}: [コメント2]  
3. {type_name}: [コメント3]

各コメントは50文字以内で、丁寧で建設的な表現にしてください。
"""
            
            messages = [
                {"role": "system", "content": "あなたは市民の声を建設的で自然な表現に導く専門家です。"},
                {"role": "user", "content": prompt}
            ]
            
            result = self.ai.chat_completion(messages, max_tokens=400, temperature=0.8)
            return self._parse_typed_comment_suggestions(result, type_name)
            
        except Exception as e:
            logger.error(f"タイプ別コメント候補生成エラー: {e}")
            # フォールバック候補
            fallback_suggestions = {
                "共感": [
                    "このニュースに関心があります",
                    "同じように感じている市民は多いと思います", 
                    "重要な問題だと思います"
                ],
                "質問": [
                    "詳細を教えてください",
                    "いつから実施される予定ですか？",
                    "どのような影響がありますか？"
                ],
                "改善提案": [
                    "より良い方法があるかもしれません",
                    "他の自治体の事例も参考になりそうです",
                    "市民の意見も聞いてほしいです"
                ],
                "感謝": [
                    "情報をありがとうございます",
                    "取り組みに感謝します",
                    "期待しています"
                ]
            }
            
            type_name = type_names.get(comment_type, "共感")
            suggestions = fallback_suggestions.get(type_name, fallback_suggestions["共感"])
            
            return [{"type": type_name, "text": text} for text in suggestions]
    
    def _parse_typed_comment_suggestions(self, response: str, type_name: str) -> List[Dict[str, str]]:
        """タイプ別コメント候補の応答を解析"""
        suggestions = []
        lines = response.strip().split('\n')
        
        for line in lines:
            if f'{type_name}:' in line:
                text = line.split(f'{type_name}:')[1].strip()
                suggestions.append({"type": type_name, "text": text})
        
        # 3つ未満の場合はフォールバック
        while len(suggestions) < 3:
            suggestions.append({"type": type_name, "text": f"このニュースについて{type_name}の気持ちです"})
        
        return suggestions[:3]  # 最大3つまで
    
    def filter_comment(self, comment: str) -> str:
        """コメントを安全で建設的な表現にフィルタリング"""
        try:
            prompt = f"""
以下のコメントを、より建設的で安全な表現に修正してください。
攻撃的な表現、誤解を招く表現、炎上しそうな表現を和らげて、
同じ意図を保ちながら丁寧で建設的な表現に変換してください。

元のコメント: {comment}

修正されたコメント:
"""
            
            messages = [
                {"role": "system", "content": "あなたはコミュニケーションを円滑にする専門家です。"},
                {"role": "user", "content": prompt}
            ]
            
            filtered_comment = self.ai.chat_completion(messages, max_tokens=200, temperature=0.3).strip()
            return filtered_comment if filtered_comment else comment
            
        except Exception as e:
            logger.error(f"コメントフィルタエラー: {e}")
            return comment
    
    def generate_chat_response(self, user_comment: str, comment_type: str, news_title: str, news_summary: str) -> str:
        """コメント投稿後のAI初期レスポンスを生成"""
        try:
            type_responses = {
                "empathy": "共感してくださってありがとうございます",
                "question": "ご質問をいただき、ありがとうございます",
                "improvement": "建設的なご提案をありがとうございます",
                "gratitude": "温かいお言葉をありがとうございます"
            }
            
            greeting = type_responses.get(comment_type, "コメントをありがとうございます")
            
            prompt = f"""
あなたは渋谷区の市民対話AIアシスタントです。市民からのコメントに対して、親しみやすく建設的な対話を始めてください。

ニュース: {news_title}
要約: {news_summary}
市民のコメント: {user_comment}
コメントタイプ: {comment_type}

以下の点を含めて応答してください：
1. {greeting}
2. コメントの内容に対する理解や共感
3. さらに詳しく聞きたい点や、関連する質問
4. 建設的な対話を促す質問

150文字以内で、親しみやすく丁寧な口調で応答してください。
"""
            
            messages = [
                {"role": "system", "content": "あなたは渋谷区の市民対話を促進する親しみやすいAIアシスタントです。"},
                {"role": "user", "content": prompt}
            ]
            
            response = self.ai.chat_completion(messages, max_tokens=200, temperature=0.7)
            return response.strip()
            
        except Exception as e:
            logger.error(f"AIチャット初期レスポンス生成エラー: {e}")
            return "コメントをありがとうございます！このニュースについて、もう少し詳しくお聞かせください。"
    
    def generate_chat_conversation(self, user_message: str, conversation_history: list, news_title: str, news_summary: str) -> str:
        """継続的なAIチャット会話を生成"""
        try:
            # 会話履歴を構築
            conversation_context = ""
            for msg in conversation_history[-5:]:  # 最新5件の会話のみ使用
                role = "市民" if msg.get("role") == "user" else "AI"
                conversation_context += f"{role}: {msg.get('message', '')}\n"
            
            prompt = f"""
あなたは渋谷区の市民対話AIアシスタントです。以下のニュースについて市民と建設的な対話を続けてください。

ニュース: {news_title}
要約: {news_summary}

これまでの会話:
{conversation_context}

市民の最新メッセージ: {user_message}

以下の点を心がけて応答してください：
1. 市民の意見を尊重し、理解を示す
2. 新しい視点や情報を提供する
3. さらなる対話を促す質問をする
4. 建設的で前向きな議論を促進する

150文字以内で、親しみやすく丁寧な口調で応答してください。
"""
            
            messages = [
                {"role": "system", "content": "あなたは渋谷区の市民対話を促進する親しみやすいAIアシスタントです。"},
                {"role": "user", "content": prompt}
            ]
            
            response = self.ai.chat_completion(messages, max_tokens=200, temperature=0.7)
            return response.strip()
            
        except Exception as e:
            logger.error(f"AIチャット会話生成エラー: {e}")
            return "興味深いご意見ですね。このテーマについて、他にもお考えがあれば教えてください。"

# 使用例
if __name__ == "__main__":
    summarizer = NewsSummarizer()
    
    # テスト用のニュース
    test_title = "渋谷区総合防災訓練を実施"
    test_content = "渋谷区では、災害に備えるため区内11地区で総合防災訓練を実施します。市民の皆様の参加をお待ちしています。"
    
    # 要約テスト
    summaries = summarizer.summarize_news(test_title, test_content)
    print("=== 要約結果 ===")
    for key, value in summaries.items():
        print(f"{key}: {value}")
    
    # コメント候補テスト
    suggestions = summarizer.generate_comment_suggestions(test_title, summaries["解説"])
    print("\n=== コメント候補 ===")
    for suggestion in suggestions:
        print(f"{suggestion['type']}: {suggestion['text']}") 