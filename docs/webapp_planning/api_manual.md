# 収支管理アプリ — クイック入力API マニュアル

## 概要

このAPIを使うと、iOSショートカット・Zapier・スクリプトなどの外部ツールから取引データを直接登録できます。

---

## 認証

すべてのリクエストには、設定画面で発行した **APIキー** が必要です。

| 項目 | 内容 |
|------|------|
| 方式 | Bearer トークン |
| ヘッダー名 | `Authorization` |
| フォーマット | `Bearer sk_xxxxxxxxxxxxxxxx...` |

**APIキーの発行先:** `アプリURL/settings/api-keys`

---

## エンドポイント

### `POST /api/transactions` — 取引を登録する

| 項目 | 内容 |
|------|------|
| メソッド | POST |
| URL | `https://your-app.vercel.app/api/transactions` |
| Content-Type | `application/json` |

#### リクエストボディ

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| `type` | string | ✅ | `expense`（支出）/ `income`（収入）/ `transfer`（振替）/ `adjustment`（調整） |
| `amount` | number | ✅ | 金額（正の整数、例: 500） |
| `date` | string | | 日付 `YYYY-MM-DD`。省略時は今日 |
| `description` | string | | 内容のメモ（例: "ランチ"） |
| `place` | string | | 場所（例: "セブンイレブン"） |
| `category` | string | | カテゴリ名（例: "食費"）←設定済みの名前で指定 |
| `from_account` | string | | 出金口座名（例: "現金"、"楽天銀行"） |
| `to_account` | string | | 振込先口座名（`transfer` 時に使用） |
| `credit_card` | string | | カード名（例: "楽天カード"） |
| `tags` | string[] | | タグ（例: `["外食", "仕事"]`） |

> カテゴリ名・口座名は**設定画面で登録されている名前と一致**している必要があります。

#### レスポンス（成功）

```json
HTTP/1.1 201 Created

{
  "success": true,
  "transaction": {
    "id": "e40ccb4d-...",
    "type": "expense",
    "amount": 500,
    "date": "2026-03-03",
    "description": "コンビニ"
  }
}
```

#### レスポンス（エラー）

| ステータス | エラー例 |
|---|---|
| `401` | APIキーが無効または無効化されている |
| `400` | `type` や `amount` が不正な値 |
| `500` | サーバーエラー |

---

## 使用例

### cURL（基本）

```bash
curl -X POST https://your-app.vercel.app/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk_xxxxxxxxxxxx" \
  -d '{
    "type": "expense",
    "amount": 500,
    "description": "コンビニ",
    "category": "食費",
    "from_account": "現金"
  }'
```

### cURL（振替）

```bash
curl -X POST https://your-app.vercel.app/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk_xxxxxxxxxxxx" \
  -d '{
    "type": "transfer",
    "amount": 10000,
    "description": "口座間振替",
    "from_account": "楽天銀行",
    "to_account": "現金"
  }'
```

### PowerShell (Windows)

```powershell
# body.json に JSON を書いて実行
@'
{"type":"expense","amount":1200,"description":"ランチ","category":"食費","from_account":"現金"}
'@ | Out-File -Encoding UTF8 body.json

curl -X POST "https://your-app.vercel.app/api/transactions" `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer sk_xxxxxxxxxxxx" `
  --data-binary "@body.json"
```

### iOSショートカット

1. 「テキスト」アクションで JSON を作成
2. 「URLの内容を取得」アクション:
   - URL: `https://your-app.vercel.app/api/transactions`
   - メソッド: `POST`
   - ヘッダー: `Authorization: Bearer sk_xxxxxxxxxxxx`
   - リクエストの本文: `JSON` を選択し上記テキストを渡す

### Zapier / Make（旧 Integromat）

| 設定項目 | 値 |
|---|---|
| URL | `https://your-app.vercel.app/api/transactions` |
| Method | POST |
| Headers | `Authorization: Bearer sk_xxxxxxxxxxxx` |
| Body type | JSON |

---

## よくある質問

**Q: カテゴリ名を間違えた場合は？**  
A: 登録名と一致しない場合、`category_id` は `null` になります（エラーにはなりません）。設定画面でカテゴリを確認してください。

**Q: APIキーが漏洩した場合は？**  
A: 設定画面（`/settings/api-keys`）から即座に「無効化」または「削除」し、新しいキーを発行してください。

**Q: ローカル開発環境でテストしたい**  
A: URL を `http://localhost:3001/api/transactions` に変更してください。

---

*このドキュメントは `/docs/webapp_planning/api_manual.md` に保存されています。*
