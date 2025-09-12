# 渋谷共創ダッシュボード Makefile

.PHONY: help setup start stop clean install test flutter-setup flutter-run flutter-build

# デフォルトターゲット
help:
	@echo "🏗️  渋谷共創ダッシュボード開発環境"
	@echo ""
	@echo "利用可能なコマンド:"
	@echo "  make setup        - 初回セットアップ（仮想環境作成、依存関係インストール）"
	@echo "  make start        - 開発サーバー起動（バックエンドのみ）"
	@echo "  make stop         - 開発サーバー停止"
	@echo "  make install      - 依存関係の再インストール"
	@echo "  make clean        - 一時ファイルとキャッシュをクリア"
	@echo "  make test         - テスト実行"
	@echo ""
	@echo "Flutter関連:"
	@echo "  make flutter-setup - Flutter依存関係のセットアップ"
	@echo "  make flutter-run   - Flutterアプリの起動"
	@echo "  make flutter-build - Flutterアプリのビルド"
	@echo ""

# 初回セットアップ
setup:
	@echo "🚀 初回セットアップを開始..."
	@# pyenv設定確認
	@if ! command -v pyenv >/dev/null 2>&1; then \
		echo "⚠️  pyenvがインストールされていません"; \
		echo "Homebrewでインストール: brew install pyenv"; \
		exit 1; \
	fi
	@# Python仮想環境作成
	@if [ ! -d "venv" ]; then \
		echo "📦 Python仮想環境を作成中..."; \
		python -m venv venv; \
	fi
	@# 依存関係インストール
	@echo "📦 Python依存関係をインストール中..."
	@source venv/bin/activate && pip install -r requirements.txt
	@# フロントエンド依存関係インストール
	@echo "📦 フロントエンド依存関係をインストール中..."
	@cd frontend && npm install
	@echo "✅ セットアップ完了！"
	@echo "開発を開始するには: make start"

# 開発サーバー起動
start:
	@./start-dev.sh

# 開発サーバー停止
stop:
	@./stop-dev.sh

# 依存関係の再インストール
install:
	@echo "📦 依存関係を再インストール中..."
	@source venv/bin/activate && pip install -r requirements.txt
	@cd frontend && npm install
	@echo "✅ 依存関係の再インストール完了"

# クリーンアップ
clean:
	@echo "🧹 一時ファイルをクリーンアップ中..."
	@rm -f .backend.pid .frontend.pid
	@find . -name "*.pyc" -delete
	@find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
	@cd frontend && npm run build > /dev/null 2>&1 || true
	@echo "✅ クリーンアップ完了"

# テスト実行
test:
	@echo "🧪 テストを実行中..."
	@source venv/bin/activate && python -m pytest tests/ -v
	@echo "✅ テスト完了"

# 仮想環境の完全削除と再作成
reset:
	@echo "🔄 環境をリセット中..."
	@make stop
	@rm -rf venv
	@make setup
	@echo "✅ 環境リセット完了"

# Flutter関連コマンド
flutter-setup:
	@echo "📱 Flutter依存関係をセットアップ中..."
	@cd shibuya_app && flutter pub get
	@cd shibuya_app && flutter packages pub run build_runner build
	@echo "✅ Flutter依存関係のセットアップ完了"

flutter-run:
	@echo "📱 Flutterアプリを起動中..."
	@cd shibuya_app && flutter run

flutter-build:
	@echo "📱 Flutterアプリをビルド中..."
	@cd shibuya_app && flutter build apk --release
	@echo "✅ APKファイルが生成されました: shibuya_app/build/app/outputs/flutter-apk/app-release.apk" 