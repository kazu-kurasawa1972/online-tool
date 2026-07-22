// オンラインツール案内 — 公開ページ（パスワードで暗号化されたデータを読み込み）
// data.enc を取得 → 入力されたパスワードでブラウザ内復号 → 表示。
// パスワードはサーバーにもgitにも保存されません。

/* ---------- 表示ヘルパー ---------- */
function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
function hasText(s) {
  return s != null && String(s).trim() !== "";
}

// 暗号処理（decryptPayload など）は crypto-util.js を参照

/* ---------- 各セクション描画 ---------- */
function renderLine(data) {
  if (!data || data.enabled === false) return "";
  const items = (data.items || []).filter(
    (it) => hasText(it.label) || hasText(it.qrImage) || hasText(it.url)
  );
  let inner;
  if (items.length === 0) {
    inner = `<p class="empty-note">（未設定）</p>`;
  } else {
    inner =
      `<div class="qr-grid">` +
      items
        .map((it) => {
          const img = hasText(it.qrImage)
            ? `<img src="${esc(it.qrImage)}" alt="${esc(it.label)} QRコード" />`
            : `<p class="empty-note">QR画像 未設定</p>`;
          const link = hasText(it.url)
            ? `<a href="${esc(it.url)}" target="_blank" rel="noopener">参加リンク</a>`
            : "";
          return `<div class="qr-item">${img}<div class="qr-label">${esc(
            it.label
          )}</div>${link}</div>`;
        })
        .join("") +
      `</div>`;
  }
  return card("dot-line", data.heading || "LINEオープンチャット", data.description, inner);
}

function renderTeams(data) {
  if (!data || data.enabled === false) return "";
  const courses = (data.courses || []).filter(
    (c) => hasText(c.name) || hasText(c.url) || hasText(c.code)
  );
  let inner;
  if (courses.length === 0) {
    inner = `<p class="empty-note">（未設定）</p>`;
  } else {
    inner =
      `<div class="table-wrap"><table><thead><tr>` +
      `<th>科目名</th><th>参加リンク</th><th>チームコード</th>` +
      `</tr></thead><tbody>` +
      courses
        .map((c) => {
          const link = hasText(c.url)
            ? `<a href="${esc(c.url)}" target="_blank" rel="noopener">参加する</a>`
            : "—";
          const code = hasText(c.code)
            ? `<span class="code-chip">${esc(c.code)}</span>`
            : "—";
          return `<tr><td>${esc(c.name) || "—"}</td><td>${link}</td><td>${code}</td></tr>`;
        })
        .join("") +
      `</tbody></table></div>`;
  }
  return card("dot-teams", data.heading || "Microsoft Teams", data.description, inner);
}

function renderFaculty(data) {
  if (!data || data.enabled === false) return "";
  const members = (data.members || []).filter(
    (m) => hasText(m.name) || hasText(m.email)
  );
  let inner;
  if (members.length === 0) {
    inner = `<p class="empty-note">（未設定）</p>`;
  } else {
    inner =
      `<ul class="faculty-list">` +
      members
        .map((m) => {
          const mail = hasText(m.email)
            ? `<a href="mailto:${esc(m.email)}">${esc(m.email)}</a>`
            : `<span class="empty-note">メール 未設定</span>`;
          return `<li><span class="name">${esc(m.name) || "—"}</span>${mail}</li>`;
        })
        .join("") +
      `</ul>`;
  }
  return card("dot-faculty", data.heading || "教員連絡先", data.description, inner);
}

function renderZoom(data) {
  if (!data || data.enabled === false) return "";
  const rows = [];
  if (hasText(data.meetingId)) rows.push(rowHtml("ミーティングID", data.meetingId));
  if (hasText(data.passcode)) rows.push(rowHtml("パスコード", data.passcode));
  const btn = hasText(data.url)
    ? `<a class="btn" href="${esc(data.url)}" target="_blank" rel="noopener">Zoomに参加する</a>`
    : "";
  let inner;
  if (rows.length === 0 && !btn) {
    inner = `<p class="empty-note">（未設定）</p>`;
  } else {
    inner = (rows.length ? `<div class="zoom-info">${rows.join("")}</div>` : "") + btn;
  }
  return card("dot-zoom", data.heading || "Zoom 共通リンク", data.description, inner);
}

function rowHtml(label, value) {
  return `<div class="zoom-row"><span class="label">${esc(
    label
  )}</span><span class="value">${esc(value)}</span></div>`;
}
function card(dotClass, heading, desc, innerHtml) {
  const d = hasText(desc) ? `<p class="card-desc">${esc(desc)}</p>` : "";
  return `<section class="card">
    <h2 class="card-heading"><span class="dot ${dotClass}"></span>${esc(heading)}</h2>
    ${d}${innerHtml}
  </section>`;
}

function render(data) {
  if (hasText(data.title)) {
    document.title = data.title;
    const t = document.getElementById("site-title");
    if (t) t.textContent = data.title;
  }
  const badge = document.getElementById("year-badge");
  if (badge) badge.textContent = data.year || "";

  const html =
    renderLine(data.lineOpenChat) +
    renderTeams(data.teams) +
    renderFaculty(data.faculty) +
    renderZoom(data.zoom);

  document.getElementById("content").innerHTML =
    html || `<p class="empty-note">表示する項目がありません。</p>`;
}

/* ---------- パスワードゲート ---------- */
const SS_KEY = "online-tool-pw"; // このタブ内のみ保持（sessionStorage）
let encPayload = null;

function showGate(message) {
  document.getElementById("content").innerHTML = `
    <div class="gate">
      <div class="gate-card">
        <div class="gate-lock">🔒</div>
        <h2>パスワードが必要です</h2>
        <p class="gate-desc">このページを表示するにはパスワードを入力してください。</p>
        <form id="gate-form">
          <input id="gate-pw" type="password" autocomplete="current-password"
                 placeholder="パスワード" autofocus />
          <label class="gate-remember">
            <input type="checkbox" id="gate-remember" checked />
            このタブで保持する
          </label>
          <button type="submit" class="btn gate-btn">表示する</button>
          <p id="gate-msg" class="gate-msg">${message ? esc(message) : ""}</p>
        </form>
      </div>
    </div>`;
  document.getElementById("gate-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const pw = document.getElementById("gate-pw").value;
    const remember = document.getElementById("gate-remember").checked;
    await tryDecrypt(pw, remember, true);
  });
}

async function tryDecrypt(pw, remember, fromUser) {
  const msg = document.getElementById("gate-msg");
  if (msg) msg.textContent = "確認中...";
  try {
    const data = await decryptPayload(encPayload, pw);
    if (remember) sessionStorage.setItem(SS_KEY, pw);
    render(data);
  } catch (err) {
    sessionStorage.removeItem(SS_KEY);
    if (fromUser) {
      if (msg) {
        msg.textContent = "パスワードが違います。";
        msg.classList.add("error");
      }
    } else {
      showGate(""); // 保存PWが無効だった場合は静かにフォーム表示
    }
  }
}

async function init() {
  try {
    const res = await fetch("data.enc", { cache: "no-store" });
    if (res.status === 404) {
      document.getElementById("content").innerHTML =
        `<div class="error-box">データ（data.enc）がまだ設定されていません。<br />` +
        `<code>encrypt.html</code> で内容とパスワードを入力して <code>data.enc</code> を作成し、` +
        `リポジトリに追加してください。</div>`;
      return;
    }
    if (!res.ok) throw new Error("data.enc を読み込めませんでした (" + res.status + ")");
    encPayload = await res.json();
  } catch (err) {
    document.getElementById("content").innerHTML =
      `<div class="error-box">読み込みエラー: ${esc(err.message)}</div>`;
    return;
  }

  const saved = sessionStorage.getItem(SS_KEY);
  if (saved) {
    await tryDecrypt(saved, true, false);
  } else {
    showGate("");
  }
}

init();
