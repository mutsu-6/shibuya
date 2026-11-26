import os
import requests
from typing import Dict, List, Optional
from dotenv import load_dotenv
import logging
import json

load_dotenv()
logger = logging.getLogger(__name__)

class AIAdapter:
    """OpenAI APIとOllama APIを切り替え可能なAIアダプター"""
    
    def __init__(self, use_ollama: bool = True):
        self.use_ollama = use_ollama
        self.ollama_base_url = "http://localhost:11434"
        self.ollama_model = "llama3.2:3b"
        
        if not use_ollama:
            try:
                import openai
                self.openai_client = openai.OpenAI(
                    api_key=os.getenv('OPENAI_API_KEY')
                )
            except ImportError:
                logger.error("OpenAIライブラリがインストールされていません")
                self.openai_client = None
    
    def chat_completion(self, messages: List[Dict], max_tokens: int = 500, temperature: float = 0.3) -> str:
        """チャット補完を実行（OpenAI/Ollama切り替え可能）"""
        try:
            if self.use_ollama:
                return self._ollama_chat_completion(messages, max_tokens, temperature)
            else:
                return self._openai_chat_completion(messages, max_tokens, temperature)
        except Exception as e:
            logger.error(f"AI補完エラー: {e}")
            return "AI応答の生成に失敗しました"
    
    def _ollama_chat_completion(self, messages: List[Dict], max_tokens: int, temperature: float) -> str:
        """Ollama APIを使用したチャット補完"""
        try:
            # メッセージを単一のプロンプトに変換
            prompt = self._messages_to_prompt(messages)
            
            payload = {
                "model": self.ollama_model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": temperature,
                    "num_predict": max_tokens
                }
            }
            
            response = requests.post(
                f"{self.ollama_base_url}/api/generate",
                json=payload,
                timeout=30
            )
            response.raise_for_status()
            
            result = response.json()
            return result.get("response", "応答を取得できませんでした")
            
        except Exception as e:
            logger.error(f"Ollama API エラー: {e}")
            return "Ollama応答の生成に失敗しました"
    
    def _openai_chat_completion(self, messages: List[Dict], max_tokens: int, temperature: float) -> str:
        """OpenAI APIを使用したチャット補完"""
        try:
            if not self.openai_client:
                return "OpenAIクライアントが初期化されていません"
                
            response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"OpenAI API エラー: {e}")
            return "OpenAI応答の生成に失敗しました"
    
    def _messages_to_prompt(self, messages: List[Dict]) -> str:
        """OpenAI形式のメッセージをOllama用のプロンプトに変換"""
        prompt_parts = []
        
        for message in messages:
            role = message.get("role", "user")
            content = message.get("content", "")
            
            if role == "system":
                prompt_parts.append(f"システム指示: {content}")
            elif role == "user":
                prompt_parts.append(f"ユーザー: {content}")
            elif role == "assistant":
                prompt_parts.append(f"アシスタント: {content}")
        
        return "\n\n".join(prompt_parts) + "\n\nアシスタント: "
    
    def test_connection(self) -> bool:
        """AI接続をテスト"""
        try:
            test_messages = [
                {"role": "system", "content": "あなたは日本語で応答するAIです。"},
                {"role": "user", "content": "こんにちは"}
            ]
            
            response = self.chat_completion(test_messages, max_tokens=50)
            return len(response) > 0 and "失敗" not in response
            
        except Exception as e:
            logger.error(f"AI接続テストエラー: {e}")
            return False
    
    def get_provider_info(self) -> Dict:
        """使用中のAIプロバイダー情報を取得"""
        if self.use_ollama:
            try:
                # Ollamaの状態を確認
                response = requests.get(f"{self.ollama_base_url}/api/tags", timeout=5)
                models = response.json().get("models", []) if response.status_code == 200 else []
                
                return {
                    "provider": "Ollama",
                    "base_url": self.ollama_base_url,
                    "model": self.ollama_model,
                    "available_models": [m.get("name") for m in models],
                    "status": "connected" if models else "disconnected"
                }
            except:
                return {
                    "provider": "Ollama",
                    "base_url": self.ollama_base_url,
                    "model": self.ollama_model,
                    "status": "disconnected"
                }
        else:
            return {
                "provider": "OpenAI",
                "model": "gpt-3.5-turbo",
                "api_key_set": bool(os.getenv('OPENAI_API_KEY')),
                "status": "configured" if os.getenv('OPENAI_API_KEY') else "not_configured"
            }

# グローバルAIアダプターインスタンス
# 環境変数でOllama使用を制御
USE_OLLAMA = os.getenv('USE_OLLAMA', 'true').lower() == 'true'
ai_adapter = AIAdapter(use_ollama=USE_OLLAMA)

# 使用例とテスト
if __name__ == "__main__":
    print("=== AIアダプターテスト ===")
    
    # プロバイダー情報を表示
    provider_info = ai_adapter.get_provider_info()
    print(f"プロバイダー: {provider_info}")
    
    # 接続テスト
    print("\n接続テスト中...")
    if ai_adapter.test_connection():
        print("✅ AI接続成功")
        
        # 実際のテスト
        test_messages = [
            {"role": "system", "content": "あなたは渋谷区の情報を市民に分かりやすく伝える専門家です。"},
            {"role": "user", "content": "防災訓練について30文字以内で要約してください。"}
        ]
        
        response = ai_adapter.chat_completion(test_messages, max_tokens=100)
        print(f"テスト応答: {response}")
        
    else:
        print("❌ AI接続失敗")
        print("Ollamaが起動していることを確認してください: brew services start ollama") 