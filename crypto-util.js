// 暗号ユーティリティ（Web Crypto） — index.html と encrypt.html の共通処理
// 方式: AES-GCM 256bit ＋ PBKDF2-SHA256。パスワードはどこにも保存・送信されません。

const PBKDF2_ITERATIONS = 250000;

function b64(bytes) {
  let s = "";
  bytes.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s);
}

function ub64(str) {
  const bin = atob(str);
  const a = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i);
  return a;
}

async function deriveKey(password, salt, iterations) {
  const km = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    km,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// オブジェクト → data.enc に書き出すペイロード
async function encryptJSON(obj, password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const iterations = PBKDF2_ITERATIONS;
  const key = await deriveKey(password, salt, iterations);
  const ct = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(JSON.stringify(obj))
  );
  return {
    v: 1,
    alg: "AES-GCM",
    kdf: "PBKDF2-SHA256",
    iterations,
    salt: b64(salt),
    iv: b64(iv),
    ct: b64(new Uint8Array(ct)),
  };
}

// data.enc のペイロード → オブジェクト（パスワードが違えば例外）
async function decryptPayload(payload, password) {
  const key = await deriveKey(
    password,
    ub64(payload.salt),
    payload.iterations || PBKDF2_ITERATIONS
  );
  const pt = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ub64(payload.iv) },
    key,
    ub64(payload.ct)
  );
  return JSON.parse(new TextDecoder().decode(pt));
}
