# Expense Tracker (支出管理アプリ)

シンプルで美しい支出管理アプリケーションです。
ブラウザの `localStorage` にデータを保存し、Google Apps Script (GAS) を利用して Google Spreadsheet にバックアップを保存します。

## 📁 ファイル構成
- `index.html`: アプリケーションのメイン画面
- `style.css`: スタイルシート（Glassmorphismデザイン）
- `script.js`: アプリケーションのロジック
- `code.gs`: Google Apps Script バックエンドコード
- `specification.md`: 仕様書

## 🚀 セットアップ手順

### 1. Google Apps Script (GAS) の設定
1. Google Spreadsheet を新規作成します。
2. メニューの「拡張機能」>「Apps Script」を開きます。
3. エディタが開いたら、`code.gs` の内容をコピーして貼り付けます（元のコードは削除してください）。
4. 「デプロイ」ボタン > 「新しいデプロイ」を選択します。
5. 「種類の選択」の歯車アイコン > 「ウェブアプリ」を選択します。
6. 設定を以下のようにします：
   - **説明**: Expense Tracker API (任意)
   - **次のユーザーとして実行**: 自分
   - **アクセスできるユーザー**: **全員** (これ重要です！)
7. 「デプロイ」をクリックし、アクセス権限を承認します。
8. 発行された **ウェブアプリのURL** をコピーします。

### 2. フロントエンドの設定
1. `script.js` をテキストエディタで開きます。
2. 3行目の `const GAS_API_URL = '';` の引用符の中に、先ほどコピーしたURLを貼り付けます。
   ```javascript
   const GAS_API_URL = 'https://script.google.com/macros/s/xxxxx/exec';
   ```
3. 保存します。

### 3. アプリの実行
- `index.html` をブラウザで開くだけで利用可能です。
- GitHub Pages で公開する場合は、リポジトリの設定から Pages を有効にしてください。

## ✅ 課題完了報告

```text
【🎉課題4完了報告🎉】
研修生：田中太郎（user01）
完了：2025/11/25 10:00

アプリURL: (GitHub PagesのURLなどをここに記載)

仕様書URL: ./specification.md

確認をお願いします！
```
