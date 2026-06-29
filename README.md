# オンラインツール案内

授業で使うオンラインツール（LINEオープンチャット / Microsoft Teams / 教員連絡先 / Zoom）の
案内ページです。HTML・CSS・JavaScript のみで作られた静的サイトで、**GitHub Pages** で公開できます。

このフォルダの中身を、公開用リポジトリの**直下**に置いて使う想定です。

参考: https://v0-online-tool-guide.vercel.app/

## ファイル構成

| ファイル | 役割 |
| --- | --- |
| `index.html` | 公開ページ（閲覧用） |
| `styles.css` | スタイル |
| `app.js` | `data.json` を読み込んで表示 |
| `data.json` | **表示内容のデータ（ここを編集します）** |
| `images/` | QRコード画像などを置く場所 |
| `.nojekyll` | GitHub Pages がファイルをそのまま配信するための設定 |

## 内容の編集方法

`data.json` をテキストエディタで書き換えて `git push` すると、公開ページに反映されます。
構造は以下のとおり。各セクションは `"enabled": false` にすると非表示にできます。

```jsonc
{
  "title": "オンラインツール案内",
  "year": "2025年度",
  "lineOpenChat": {
    "enabled": true,                 // false にするとこの項目を非表示
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

`items` / `courses` / `members` は配列なので、`{ ... }` を増やせば項目を追加できます。

### QRコード画像の追加
画像ファイルを `images/` フォルダに置き、`data.json` の `qrImage` に
`images/ファイル名.png` のように相対パスで指定します。

## ローカルでの確認

`data.json` は `file://` で開くと読み込めない（CORS制限）ため、簡易サーバー経由で開きます。
このフォルダで以下を実行してください。

```bash
python -m http.server 8000
# → ブラウザで http://localhost:8000/ を開く
```

## GitHub Pages での公開手順

このフォルダの中身が公開リポジトリの直下にある前提です。

1. リポジトリを GitHub に push する
2. GitHub のリポジトリ → **Settings** → **Pages**
3. **Build and deployment** → Source を **Deploy from a branch** にする
4. Branch を `main`、フォルダを **`/ (root)`** にして Save
5. 数分後、表示される URL（例 `https://<ユーザー名>.github.io/<リポジトリ名>/`）で公開されます
