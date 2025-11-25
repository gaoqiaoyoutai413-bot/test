# 支出管理アプリ 仕様書

## 1. 概要
ユーザーが日々の支出を記録し、ブラウザ上で管理できるWebアプリケーション。
データはブラウザの `localStorage` に保存されるほか、Google Apps Script (GAS) を介して Google Spreadsheet にもバックアップ可能とする。

## 2. 機能要件

### 2.1 支出記録機能
- **入力項目**:
  - 日付 (Date): デフォルトは当日
  - カテゴリ (Category): セレクトボックス（食費, 交通費, 娯楽費, 固定費, その他）
  - 金額 (Amount): 数値入力
  - メモ (Memo): 自由記述（任意）
- **保存アクション**:
  - 「登録」ボタン押下で `localStorage` に保存。
  - 成功時、フォームをリセットし、一覧を更新。

### 2.2 支出一覧表示機能
- 保存されたデータをリスト形式で表示（新しい順）。
- 各行に「削除」ボタンを配置。
- 削除ボタン押下で該当データを削除し、表示を更新。

### 2.3 カテゴリ別集計機能
- 登録データの合計金額をカテゴリ別に集計して表示。
- 全体の合計金額も表示。

### 2.4 データ永続化・同期
- **ローカル**: `localStorage` を主データソースとする。
- **クラウド**: GASのエンドポイントへPOSTリクエストを送り、スプレッドシートに行を追加する（非同期、エラー時はコンソールログ出力のみでユーザー操作を阻害しない）。

## 3. 技術スタック
- **Frontend**: HTML5, CSS3 (Modern UI), JavaScript (ES6+)
- **Backend**: Google Apps Script (Web App deployment)
- **Database**: localStorage (Primary), Google Sheets (Secondary)

## 4. デザイン要件
- **テーマ**: モダンでプレミアムなデザイン（Glassmorphism, Gradient）。
- **レスポンシブ**: PCおよびモバイルで見やすいレイアウト。
- **インタラクション**: ボタンのホバー効果、リスト追加時のアニメーション。

## 5. データ構造 (localStorage)
Key: `expenses`
Value: JSON String
```json
[
  {
    "id": 1696501234567,
    "date": "2025-10-05",
    "category": "食費",
    "amount": 800,
    "memo": "ランチ"
  }
]
```
