#!/bin/bash

# 渋谷共創ダッシュボード開発環境起動スクリプト
echo "🚀 渋谷共創ダッシュボード開発環境を起動中..."

# プロジェクトディレクトリに移動
cd "$(dirname "$0")"

# pyenv設定を読み込み
export PYENV_ROOT="$HOME/.pyenv"
command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init -)"

# Python仮想環境をアクティベート
if [ -d "venv" ]; then
    echo "📦 Python仮想環境をアクティベート中..."
    source venv/bin/activate
else
    echo "⚠️  仮想環境が見つかりません。作成中..."
    python -m venv venv
    source venv/bin/activate
    echo "📦 依存関係をインストール中..."
    pip install -r requirements.txt
fi

# 依存関係の確認とインストール
echo "🔍 Python依存関係を確認中..."
pip install -r requirements.txt > /dev/null 2>&1

# フロントエンドの依存関係確認
echo "🔍 フロントエンド依存関係を確認中..."
cd frontend
npm install > /dev/null 2>&1
cd ..

# バックエンドサーバー起動
echo "🖥️  バックエンドサーバーを起動中..."
python -m uvicorn app:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# フロントエンドサーバー起動
echo "🌐 フロントエンドサーバーを起動中..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# プロセスIDを保存
echo $BACKEND_PID > .backend.pid
echo $FRONTEND_PID > .frontend.pid

echo "✅ 開発環境が起動しました！"
echo "📱 フロントエンド: http://localhost:3000"
echo "🔧 バックエンド: http://localhost:8000"
echo "📚 API文書: http://localhost:8000/docs"
echo ""
echo "🛑 停止するには: ./stop-dev.sh を実行してください"

# サーバーの起動を待つ
wait 