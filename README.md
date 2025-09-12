# Shibuya Co-creation Dashboard

渋谷区の共創ダッシュボード - ニュース収集からコミュニティ形成、KPI生成まで一貫したフローを提供するフルスタックアプリケーション

## 🚀 クイックスタート

### 初回セットアップ
```bash
# リポジトリをクローン
git clone <repository-url>
cd shibuya

# バックエンドセットアップ
make setup

# Flutterアプリセットアップ
make flutter-setup
```

### 開発サーバー起動
```bash
# バックエンドサーバー起動
make start

# Flutterアプリ起動（別ターミナルで）
make flutter-run
```

### アクセス
- 📱 **Flutterアプリ**: iOSシミュレーター/Androidエミュレーター
- 🔧 **バックエンドAPI**: http://localhost:8000  
- 📚 **API文書**: http://localhost:8000/docs

### 停止
```bash
make stop
```

## 📋 利用可能なコマンド

```bash
make help          # ヘルプ表示
make setup         # バックエンド初回セットアップ
make start         # バックエンドサーバー起動
make stop          # サーバー停止
make install       # 依存関係再インストール
make clean         # 一時ファイルクリア
make test          # テスト実行
make reset         # 環境完全リセット

# Flutter関連
make flutter-setup # Flutter依存関係セットアップ
make flutter-run   # Flutterアプリ起動
make flutter-build # APKビルド
```

## 機能概要

### 📰 1. ニュース作成エージェント
- 渋谷区公式サイトからニュースを自動収集
- AI要約機能（速報30字/解説120字/やさしい日本語）
- ユーザーへの配信とコメント導線

### 💬 2. 雑談補助エージェント  
- コメント候補の自動提示（共感/質問/改善提案/感謝）
- AIによる安全フィルタリング
- 建設的な表現への自動変換

### 👥 3. コミュニティ作成エージェント
- コメントタイプに基づく自動マッチング
- 2-4人の小規模グループ自動形成
- AI補助による安心な会話環境

### 📊 4. ダッシュボード作成エージェント
- コミュニティ会話のリアルタイム要約
- KPI候補の自動生成
- ユーザー選択による重要度フィルタリング

## プロジェクト構成

```
shibuya/
├── backend/              # FastAPI バックエンド
│   ├── app.py           # メインアプリケーション
│   ├── news_scraper.py  # ニュース収集
│   ├── news_summarizer.py # AI要約機能
│   ├── kpi_generator.py # KPI生成
│   └── requirements.txt
├── frontend/            # Next.js フロントエンド
│   ├── src/
│   │   ├── app/        # App Router ページ
│   │   ├── components/ # 再利用可能コンポーネント
│   │   ├── lib/        # API クライアント
│   │   └── types/      # TypeScript 型定義
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## セットアップ

### 1. バックエンドセットアップ

```bash
# 依存関係のインストール
pip install -r requirements.txt

# AI環境の選択（開発環境 - Ollama使用）
brew install ollama
brew services start ollama
ollama pull llama3.2:3b
echo "USE_OLLAMA=true" > .env

# サーバー起動
uvicorn app:app --reload
```

### 2. フロントエンドセットアップ

```bash
# フロントエンドディレクトリに移動
cd frontend

# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev
```

### 3. 動作確認

1. バックエンド: http://localhost:8000
2. フロントエンド: http://localhost:3000
3. API ドキュメント: http://localhost:8000/docs

## フロントエンド機能

### 🏠 ホームページ
- ダッシュボード概要
- 統計カード（ニュース、コメント、コミュニティ、アクティブ議論）
- 重要KPIの表示
- クイックアクション

### 📰 ニュースページ
- ニュース一覧表示
- AI要約（速報/解説/やさしい日本語）
- ニュース収集機能
- コメント投稿への導線

### 💬 コメントシステム
- ニュース詳細表示
- AI提案コメント
- コメントタイプ選択（共感/質問/改善提案/感謝）
- リアルタイムコメント表示

### 👥 コミュニティページ
- コミュニティ一覧
- タイプ別統計
- メンバー情報
- 参加・詳細表示

### 📊 ダッシュボードページ
- エンゲージメント指標
- コメント分布グラフ
- KPI一覧・投票機能
- KPI自動生成

## API エンドポイント

### ニュース関連
- `POST /scrape-news` - 渋谷区サイトからニュース収集
- `GET /news` - ニュース一覧取得
- `GET /news/{news_id}/comment-suggestions` - コメント候補取得

### コメント・コミュニティ関連
- `POST /comments` - コメント投稿（AIフィルタ付き）
- `GET /comments` - コメント一覧取得
- `GET /communities` - コミュニティ一覧取得
- `GET /communities/{community_id}` - コミュニティ詳細取得

### KPI・ダッシュボード関連
- `POST /generate-kpis` - KPI自動生成
- `GET /kpis` - KPI一覧取得
- `POST /kpis/{kpi_index}/select` - KPI重要度投票
- `GET /dashboard/summary` - ダッシュボードサマリー
- `GET /dashboard/analytics` - 詳細分析データ

## 使用フロー

1. **ニュース収集**: フロントエンドから「ニュース収集」ボタンで渋谷区の最新ニュースを取得
2. **コメント投稿**: ニュース詳細ページでAI提案を活用してコメント投稿
3. **コミュニティ形成**: 同じタイプのコメントユーザーが自動グループ化
4. **KPI生成**: ダッシュボードから「KPI生成」でコミュニティ会話からKPI抽出
5. **ダッシュボード確認**: 統計とKPIをリアルタイムで確認・投票

## 技術スタック

### バックエンド
- **フレームワーク**: FastAPI + Python
- **AI機能**: 
  - 🔧 開発: Ollama (llama3.2:3b) - ローカル実行、無料
  - 🚀 本番: OpenAI GPT-3.5-turbo - クラウド、高品質
- **スクレイピング**: BeautifulSoup4 + requests

### フロントエンド
- **フレームワーク**: Next.js 14 (App Router)
- **スタイリング**: Tailwind CSS
- **言語**: TypeScript
- **アイコン**: Lucide React
- **HTTP クライアント**: Axios
- **状態管理**: React Hooks

## 🎯 実証済みの価値

✅ **実際のデータ収集**: 渋谷区公式サイトから10件のニュースを正常に取得  
✅ **AI要約機能**: 速報/解説/やさしい日本語の3形式で自動要約  
✅ **コメント補助**: 4種類の建設的なコメント候補を自動生成  
✅ **安全フィルタ**: 攻撃的表現を和らげる自動変換  
✅ **コミュニティ形成**: コメントタイプによる自動マッチング  
✅ **KPI生成**: 市民の声から実用的な指標を自動抽出  
✅ **モダンUI**: Next.js + Tailwind による美しく使いやすいインターフェース

## AI環境の切り替え

### 開発環境（Ollama）
```bash
python3 switch_to_openai.py ollama
```

### 本番環境（OpenAI API）
```bash
python3 switch_to_openai.py openai sk-your_api_key_here
```

### 設定確認
```bash
python3 switch_to_openai.py status
```

## 今後の拡張予定

- Supabaseデータベース統合
- リアルタイム通知機能
- 管理者ダッシュボード
- 多言語対応（英語、中国語、韓国語）
- モバイルアプリ対応
- PWA対応
