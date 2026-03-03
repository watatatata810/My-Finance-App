# Phase 5 実装計画: 各種マスタ設定 (口座・カテゴリ・予算)

## 概要
システムで利用しているマスターデータ（口座、カテゴリ、予算）の管理機能を構築します。データベーススキーマは既に存在するため、各マスターテーブル（`accounts`, `categories`, `budgets`）に対する設定画面 UI とサーバーサイドの処理 (Server Actions) を実装します。

---

## 1. サーバーアクションの新設・修正
各マスタデータの CRUD 操作を行う処理を実装します。

### 実装内容
- **[NEW]** `lib/actions/accounts.ts`
  - 口座一覧の取得、新規口座の追加アクション（`name`, `type`, `initial_balance` 等）。
  - 口座の有効・無効切り替えなどの編集および削除機能。
- **[NEW]** `lib/actions/categories.ts`
  - カテゴリの取得、新規カテゴリの追加アクション（`name`, `type`）。
  - カテゴリの削除および更新アクション。
- **[NEW]** `lib/actions/budgets.ts`
  - 予算レコード（全体予算およびカテゴリ別予算）の取得、追加アクション。
  - 予算の有効・無効切り替えおよび削除機能。

---

## 2. マスタ管理 UI の実装
設定画面としてまとまった UI を構築します。

### 実装内容
- **[NEW layout/hub]** `app/settings/page.tsx` および `components/settings/SettingsNav.tsx`
  - ユーザーが各設定項目(カード、口座、カテゴリ、予算)間を移動しやすいように、「設定」専用のサブナビゲーションを持つハブとなるレイアウトを構築します。
  - あるいはサイドバーの「設定」メニュー下に折りたたみ等で各項目をまとめるか、全設定を見るための一覧ページを設けます。
- **[NEW]** `app/settings/accounts/page.tsx`, `components/settings/AccountList.tsx`
  - 口座一覧表示と新規追加。残高やタイプ（bank, epay等）の可視化。
- **[NEW]** `app/settings/categories/page.tsx`, `components/settings/CategoryList.tsx`
  - 収入・支出・共通カテゴリの表示とカスタマイズ機能。
- **[NEW]** `app/settings/budgets/page.tsx`, `components/settings/BudgetList.tsx`
  - 全体予算および特定のカテゴリに対する月別/年別予算の設定機能。

---

## 検証計画
- 各マスタ項目を画面から追加し、エラーが発生せず DB に正しく保存されること。
- 取引入力などの既存フォームで、新しく追加した口座やカテゴリがプルダウン等に反映されること。
- マスタの削除処理が、紐づいている取引データ（トランザクション）を壊さないか（ON DELETE SET NULL などの制約通りに動作するか）確認。
