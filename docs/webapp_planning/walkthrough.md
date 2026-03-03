# 収支管理ウェブアプリ モックアップ 完成レポート

## 概要
Google スプレッドシートの収支管理を置き換えるウェブアプリのフロントエンドモックアップを作成しました。

## 技術スタック
- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS v4** (ダークモード)
- **Recharts** (グラフ)
- **Lucide React** (アイコン)
- モックデータ **105件**の取引を含む

## 画面一覧

### ダッシュボード
![ダッシュボード上部](C:/Users/watat/.gemini/antigravity/brain/d44392b6-8914-4ce9-873e-e3de0db492b3/dashboard_top_1772539842319.png)

- 全資産合計・流動資産・月収入・月支出のサマリーカード
- 月間予算プログレスバー
- 今月の支出内訳（ドーナツチャート）
- 月別収支（棒グラフ）
- 最近の取引一覧

### 取引一覧
![取引一覧](C:/Users/watat/.gemini/antigravity/brain/d44392b6-8914-4ce9-873e-e3de0db492b3/transactions_page_1772539873636.png)

- 検索・フィルター（すべて/支出/収入/移動）
- テーブル形式（日付・種別・内容・ジャンル・場所・口座・金額）
- モバイルではカード形式に切り替え

### 資産管理
![資産管理](C:/Users/watat/.gemini/antigravity/brain/d44392b6-8914-4ce9-873e-e3de0db492b3/assets_page_1772539898992.png)

- 流動資産 / 非流動資産の分離表示
- 口座別残高の横棒グラフ

### 固定費管理
![固定費管理](C:/Users/watat/.gemini/antigravity/brain/d44392b6-8914-4ce9-873e-e3de0db492b3/auto_payments_page_1772539917410.png)

### 分析・推移
![分析ページ](C:/Users/watat/.gemini/antigravity/brain/d44392b6-8914-4ce9-873e-e3de0db492b3/analytics_top_1772539936106.png)

- 年次推移（棒グラフ＋折れ線）、月次推移（エリアチャート）
- ジャンル別支出ランキング

## デモ動画
![モックアップ操作デモ](C:/Users/watat/.gemini/antigravity/brain/d44392b6-8914-4ce9-873e-e3de0db492b3/mockup_demo_1772539797039.webp)

## ビルド結果
- ✅ TypeScript コンパイル成功
- ✅ 全7ルート静的生成OK
- ✅ 開発サーバーで全ページ動作確認済み

## ファイル構成
```
app/
├── app/
│   ├── layout.tsx          # ルートレイアウト
│   ├── globals.css          # グローバルCSS
│   ├── page.tsx            # ダッシュボード
│   ├── transactions/page.tsx
│   ├── assets/page.tsx
│   ├── auto-payments/page.tsx
│   ├── depreciation/page.tsx
│   ├── salary/page.tsx
│   └── analytics/page.tsx
├── components/
│   └── Sidebar.tsx          # サイドバー + ボトムナビ
└── lib/
    ├── types.ts             # 型定義
    └── mock-data.ts         # モックデータ（105件）
```
