#!/usr/bin/env python3
"""
本番環境用OpenAI API切り替えスクリプト
開発時はOllama、本番時はOpenAI APIを使用
"""

import os
import sys
from dotenv import load_dotenv, set_key, find_dotenv

def switch_to_openai(api_key: str):
    """OpenAI APIに切り替え"""
    print("🔄 OpenAI APIに切り替え中...")
    
    # .envファイルを探す
    env_file = find_dotenv()
    if not env_file:
        # .envファイルが存在しない場合は作成
        env_file = '.env'
        with open(env_file, 'w') as f:
            f.write('# 渋谷共創ダッシュボード環境設定\n')
    
    # 環境変数を設定
    set_key(env_file, 'USE_OLLAMA', 'false')
    set_key(env_file, 'OPENAI_API_KEY', api_key)
    
    print("✅ 設定完了")
    print(f"   - USE_OLLAMA: false")
    print(f"   - OPENAI_API_KEY: {api_key[:8]}...")
    print()
    
    # 接続テスト
    print("🔍 OpenAI API接続テスト中...")
    
    # 環境変数を再読み込み
    load_dotenv(env_file, override=True)
    
    try:
        from ai_adapter import AIAdapter
        
        # OpenAI用のアダプターを作成
        openai_adapter = AIAdapter(use_ollama=False)
        
        if openai_adapter.test_connection():
            print("✅ OpenAI API接続成功")
            
            # 簡単なテスト
            test_messages = [
                {"role": "system", "content": "あなたは渋谷区の情報を市民に分かりやすく伝える専門家です。"},
                {"role": "user", "content": "防災訓練について30文字以内で要約してください。"}
            ]
            
            response = openai_adapter.chat_completion(test_messages, max_tokens=100)
            print(f"テスト応答: {response}")
            
            return True
        else:
            print("❌ OpenAI API接続失敗")
            return False
            
    except Exception as e:
        print(f"❌ エラー: {e}")
        return False

def switch_to_ollama():
    """Ollamaに切り替え（開発用）"""
    print("🔄 Ollama（ローカル）に切り替え中...")
    
    env_file = find_dotenv()
    if not env_file:
        env_file = '.env'
        with open(env_file, 'w') as f:
            f.write('# 渋谷共創ダッシュボード環境設定\n')
    
    set_key(env_file, 'USE_OLLAMA', 'true')
    
    print("✅ 設定完了")
    print("   - USE_OLLAMA: true")
    print()
    
    # 接続テスト
    print("🔍 Ollama接続テスト中...")
    
    load_dotenv(env_file, override=True)
    
    try:
        from ai_adapter import AIAdapter
        
        ollama_adapter = AIAdapter(use_ollama=True)
        
        if ollama_adapter.test_connection():
            print("✅ Ollama接続成功")
            return True
        else:
            print("❌ Ollama接続失敗")
            print("Ollamaが起動していることを確認してください: brew services start ollama")
            return False
            
    except Exception as e:
        print(f"❌ エラー: {e}")
        return False

def show_current_config():
    """現在の設定を表示"""
    load_dotenv()
    
    use_ollama = os.getenv('USE_OLLAMA', 'true').lower() == 'true'
    openai_key = os.getenv('OPENAI_API_KEY', '')
    
    print("📊 現在の設定:")
    print(f"   - AIプロバイダー: {'Ollama (ローカル)' if use_ollama else 'OpenAI (クラウド)'}")
    print(f"   - USE_OLLAMA: {use_ollama}")
    print(f"   - OpenAI APIキー: {'設定済み' if openai_key else '未設定'}")
    
    if not use_ollama and not openai_key:
        print("⚠️  警告: OpenAI APIキーが設定されていません")

def main():
    """メイン関数"""
    print("🏢 渋谷共創ダッシュボード - AI切り替えツール")
    print("=" * 50)
    
    show_current_config()
    print()
    
    if len(sys.argv) < 2:
        print("使用方法:")
        print("  python3 switch_to_openai.py openai <API_KEY>  # OpenAI APIに切り替え")
        print("  python3 switch_to_openai.py ollama           # Ollamaに切り替え")
        print("  python3 switch_to_openai.py status           # 現在の設定を表示")
        return
    
    command = sys.argv[1].lower()
    
    if command == 'openai':
        if len(sys.argv) < 3:
            print("❌ OpenAI APIキーを指定してください")
            print("例: python3 switch_to_openai.py openai sk-...")
            return
        
        api_key = sys.argv[2]
        if switch_to_openai(api_key):
            print()
            print("🎉 OpenAI APIへの切り替えが完了しました！")
            print("サーバーを再起動してください: uvicorn app:app --reload")
        
    elif command == 'ollama':
        if switch_to_ollama():
            print()
            print("🎉 Ollamaへの切り替えが完了しました！")
            print("サーバーを再起動してください: uvicorn app:app --reload")
        
    elif command == 'status':
        show_current_config()
        
        # 接続テスト
        print("\n🔍 接続テスト:")
        try:
            from ai_adapter import ai_adapter
            provider_info = ai_adapter.get_provider_info()
            print(f"   プロバイダー: {provider_info['provider']}")
            print(f"   ステータス: {provider_info['status']}")
            
            if ai_adapter.test_connection():
                print("   接続: ✅ 成功")
            else:
                print("   接続: ❌ 失敗")
                
        except Exception as e:
            print(f"   エラー: {e}")
    
    else:
        print(f"❌ 不明なコマンド: {command}")
        print("利用可能なコマンド: openai, ollama, status")

if __name__ == "__main__":
    main() 