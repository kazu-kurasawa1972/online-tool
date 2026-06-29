# オンラインツール案内（パスワード保護版）

授業で使うオンラインツール（LINEオープンチャット / Microsoft Teams / 教員連絡先 / Zoom）の
案内ページです。HTML・CSS・JavaScript のみの静的サイトで、**GitHub Pages** で公開できます。

**ページを開くにはパスワードが必要**です。表示データは暗号化して保存され、正しいパスワードを
入れたときだけブラウザ内で復号して表示されます。

参考: https://v0-online-tool-guide.vercel.app/

## しくみ（重要）

- 実データは平文では置かず、**`data.enc`（パスワードで暗号化したファイル）**として保存します。
- ページ（`app.js`）は `data.enc` を読み込み、入力されたパスワードで**ブラウザ内で復号**します。
- パスワードはサーバーにも git にも保存されません（暗号化方式: AES-GCM ＋ PBKDF2、ブラウザ標準の Web Crypto）。
- **平文の `data.json` は `.gitignore` 済み**でリポジトリに入りません。

### セキュリティ上の注意
- パスワードを知っている人は誰でも閲覧でき、内容を他人に共有することも可能です（共有パスワード方式）。
- `data.enc` は誰でもダウンロードできるため、**弱いパスワードは時間をかければ破られる**可能性があります。
  推測されにくい長めのパスワードにしてください。
- 「URLを知っている人すべてを確実に締め出す」レベルが必要な場合は、別方式（Cloudflare Access 等）が必要です。

## ファイル構成

| ファイル | 役割 |
| --- | --- |
| `index.html` | 公開ページ |
| `styles.css` | スタイル |
| `app.js` | `data.enc` を読み込み、パスワードで復号して表示 |
| `data.enc` | **暗号化済みデータ（これを公開）** ※ `encrypt.html` で作成 |
| `encrypt.html` | **ローカル専用**。内容＋パスワードから `data.enc` を作る／復号して編集する |
| `data.example.json` | 入力内容のテンプレート（中身は空・機密なし） |
| `data.json` | ローカル作業用の平文（`.gitignore` 済み・コミットされません） |
| `images/` | QRコード画像などを置く場所 |
| `.nojekyll` | GitHub Pages 用設定 |

## 初回セットアップ（data.enc を作る）

1. このフォルダで簡易サーバーを起動（暗号機能は `http://localhost` 経由が必要）:
   ```bash
   python -m http.server 8000
   ```
2. ブラウザで **`http://localhost:8000/encrypt.html`** を開く
3. 「テンプレートを読み込む」を押し、JSON欄の内容を実際の情報に書き換える
   （メール・QR画像パス・Teamsリンク／コード・Zoom情報など）
4. **パスワード**（学生に共有するもの）を入力
5. **「暗号化して data.enc をダウンロード」** を押す
6. ダウンロードした `data.enc` をこのフォルダに置く
7. コミットして公開:
   ```bash
   git add data.enc
   git commit -m "データ更新"
   git push
   ```
8. 公開ページを開き、設定したパスワードで表示されることを確認

## 内容を後から変更するとき

1. `http://localhost:8000/encrypt.html` を開く
2. パスワード欄に現在のパスワードを入れ、「data.enc を復号して読み込む」で既存内容を展開
3. JSONを編集 → 同じ（または新しい）パスワードで「暗号化して data.enc をダウンロード」
4. `data.enc` を置き換えて `git push`

### データ構造（JSON）

各セクションは `"enabled": false` にすると非表示にできます。

```jsonc
{
  "title": "オンラインツール案内",
  "year": "2025年度",
  "lineOpenChat": {
    "enabled": true,
    "heading": "LINEオープンチャット",
    "description": "説明文",
    "items": [
      { "label": "科目名", "qrImage": "images/line1.png", "url": "https://line.me/..." }
    ]
  },
  "teams": {
    "enabled": true,
    "heading": "Microsoft Teams",
    "description": "説明文",
    "courses": [
      { "name": "科目名", "url": "https://teams.microsoft.com/...", "code": "abc123" }
    ]
  },
  "faculty": {
    "enabled": true,
    "heading": "教員連絡先",
    "description": "説明文",
    "members": [
      { "name": "○○先生", "email": "teacher@example.ac.jp" }
    ]
  },
  "zoom": {
    "enabled": true,
    "heading": "Zoom 共通リンク",
    "description": "説明文",
    "meetingId": "123 4567 8901",
    "passcode": "0000",
    "url": "https://zoom.us/j/..."
  }
}
```

QRコード画像は `images/` に置き、`qrImage` に `images/ファイル名.png` のように相対パスで指定します。
（画像自体は暗号化されないため、機密性の高い画像は注意してください）

## GitHub Pages での公開

このフォルダの中身が公開リポジトリの直下にある前提です。

1. リポジトリを GitHub に push
2. **Settings** → **Pages** → Source = **Deploy from a branch**
3. Branch = **`main`** / フォルダ = **`/ (root)`** → Save
4. `https://<ユーザー名>.github.io/<リポジトリ名>/` で公開
