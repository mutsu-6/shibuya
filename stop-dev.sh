#!/bin/bash

# 渋谷共創ダッシュボード開発環境停止スクリプト
echo "🛑 開発環境を停止中..."

cd "$(dirname "$0")"

# バックエンドサーバー停止
if [ -f ".backend.pid" ]; then
    BACKEND_PID=$(cat .backend.pid)
    echo "🖥️  バックエンドサーバー (PID: $BACKEND_PID) を停止中..."
    kill $BACKEND_PID 2>/dev/null || echo "バックエンドサーバーは既に停止しています"
    rm .backend.pid
fi

# フロントエンドサーバー停止
if [ -f ".frontend.pid" ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    echo "🌐 フロントエンドサーバー (PID: $FRONTEND_PID) を停止中..."
    kill $FRONTEND_PID 2>/dev/null || echo "フロントエンドサーバーは既に停止しています"
    rm .frontend.pid
fi

# 関連プロセスも停止
echo "🧹 関連プロセスをクリーンアップ中..."
pkill -f "uvicorn app:app" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true

echo "✅ 開発環境が停止しました" 