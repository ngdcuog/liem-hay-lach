/* Liêm hay Lách? — phần dùng chung cho màn hình MC (host.html) và điện thoại (index.html). */
(function () {
  "use strict";

  // Luật chơi: chỉnh số ở đây nếu muốn cân bằng lại.
  const CONFIG = {
    startScore: 300,          // điểm vốn mỗi người chơi khi vào phòng
    basePoints: 100,          // trả lời đúng
    speedBonus: 50,           // thưởng trả lời nhanh (tối đa)
    questionTime: 20,         // giây cho mỗi câu
    backdoorTime: 12,         // giây mở "cửa sau"
    trustBribeK: 25,          // niềm tin mất mỗi phong bì = K / số người chơi (cả lớp càng đông, mỗi phong bì càng ít ảnh hưởng)
    trustCatchK: 10,          // niềm tin hồi lại mỗi vụ bị xử lý = K / số người chơi
    reportCap: 3,             // mỗi người bị tố giác đúng chỉ thưởng cho 3 người tố đầu tiên
    trustLimit: 50,           // dưới mức này khi hết game: mọi đội bị trừ
    trustPenaltyRate: 0.2,    // trừ 20% điểm
    cleanBonus: 100,          // thưởng "Liêm chính" (không đưa phong bì nào)
    reportReward: [100, 200], // tố giác đúng: màn 1, màn 2
    reportFalsePenalty: 50,   // tố giác sai
    detectRate: [0.3, 0.6],   // xác suất thanh tra phát hiện: màn 1, màn 2
    repeatStep: 0.1,          // "càng tham càng dễ lộ": mỗi phong bì đội đã đưa trước đó cộng thêm
    detectMax: 0.9,           // xác suất phát hiện tối đa
    fineMultiplier: 2         // bị phát hiện: phạt gấp đôi số đã đưa (cộng thu hồi lợi ích)
  };

  const PERKS = {
    lode: { name: "Lộ đề", price: 50, desc: "Câu tới chỉ còn 2 đáp án trên điện thoại của bạn" },
    chay: { name: "Chạy điểm", price: 80, desc: "Câu tới được nhân đôi điểm" },
    xoa:  { name: "Xóa án", price: 70, desc: "Câu sai gần nhất được tính là đúng (+100)" }
  };

  const ROOM_PATHS = ["state", "board", "players", "answers", "bribes", "results", "private", "reports"];

  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const uid = (n = 8) => { const a = "abcdefghijkmnpqrstuvwxyz23456789"; let s = ""; const r = crypto.getRandomValues(new Uint8Array(n)); for (const x of r) s += a[x % a.length]; return s; };
  const roomCode = () => { const a = "ABCDEFGHJKLMNPQRSTUVWXYZ"; let s = ""; const r = crypto.getRandomValues(new Uint8Array(4)); for (const x of r) s += a[x % a.length]; return s; };
  const clean = v => (v === undefined ? null : JSON.parse(JSON.stringify(v)));
  const cleanPath = p => String(p || "").replace(/^\/+|\/+$/g, "");

  /* ---------- Kho dữ liệu "thử trên 1 máy": localStorage, đồng bộ giữa các tab/iframe ---------- */
  function LocalStore(room) {
    const P = "lhl:" + room + ":";
    const subs = new Set();
    let bc = null;
    try { bc = new BroadcastChannel("lhl-" + room); } catch (e) { bc = null; }
    const key = p => P + cleanPath(p);
    function read(p) {
      const base = key(p); let leaf; let found = false; const obj = {};
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k === base) { found = true; leaf = JSON.parse(localStorage.getItem(k)); }
        else if (k.startsWith(base + "/")) {
          found = true;
          const rel = k.slice(base.length + 1).split("/");
          let o = obj;
          for (let j = 0; j < rel.length - 1; j++) { if (!o[rel[j]] || typeof o[rel[j]] !== "object") o[rel[j]] = {}; o = o[rel[j]]; }
          o[rel[rel.length - 1]] = JSON.parse(localStorage.getItem(k));
        }
      }
      if (!found) return null;
      return leaf !== undefined ? leaf : obj;
    }
    function wipe(p) {
      const base = key(p); const del = [];
      for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k === base || k.startsWith(base + "/")) del.push(k); }
      del.forEach(k => localStorage.removeItem(k));
    }
    function clearAncestors(p) {
      const parts = cleanPath(p).split("/");
      for (let i = 1; i < parts.length; i++) localStorage.removeItem(key(parts.slice(0, i).join("/")));
    }
    function write(p, v) {
      if (v === null || v === undefined) return;
      if (Array.isArray(v) && v.length === 0) return;   // giống Firebase: mảng rỗng không được lưu
      if (typeof v === "object" && !Array.isArray(v)) Object.keys(v).forEach(c => write(cleanPath(p) + "/" + c, v[c]));
      else localStorage.setItem(key(p), JSON.stringify(v));
    }
    const check = () => subs.forEach(s => s.check());
    function notify() { check(); if (bc) bc.postMessage(1); }
    window.addEventListener("storage", e => { if (!e.key || e.key.startsWith(P)) check(); });
    if (bc) bc.onmessage = check;
    return {
      kind: "local",
      now: () => Date.now(),
      async set(p, v) { wipe(p); clearAncestors(p); write(p, clean(v)); notify(); },
      async update(p, o) {
        o = clean(o) || {};
        Object.keys(o).forEach(c => { const cp = cleanPath(p) + "/" + c; wipe(cp); clearAncestors(cp); write(cp, o[c]); });
        notify();
      },
      async remove(p) { wipe(p); notify(); },
      async reset() { ROOM_PATHS.forEach(wipe); notify(); },
      on(p, cb) {
        const s = { last: undefined, check() { const v = read(p); const j = JSON.stringify(v); if (j !== s.last) { s.last = j; cb(v); } } };
        subs.add(s); setTimeout(() => s.check(), 0);
        return () => subs.delete(s);
      },
      onConnection(cb) { cb(true); }
    };
  }

  /* ---------- Kho dữ liệu online: Firebase Realtime Database ---------- */
  async function FirebaseStore(cfg, room) {
    const v = "10.12.2";
    const appMod = await import(`https://www.gstatic.com/firebasejs/${v}/firebase-app.js`);
    const dbMod = await import(`https://www.gstatic.com/firebasejs/${v}/firebase-database.js`);
    const app = appMod.getApps().length ? appMod.getApp() : appMod.initializeApp(cfg);
    const db = dbMod.getDatabase(app);
    let offset = 0;
    dbMod.onValue(dbMod.ref(db, ".info/serverTimeOffset"), s => { offset = s.val() || 0; });
    const base = "rooms/" + room + "/";
    const r = p => dbMod.ref(db, base + cleanPath(p));
    return {
      kind: "firebase",
      now: () => Date.now() + offset,
      set: (p, v) => dbMod.set(r(p), clean(v)),
      update: (p, o) => dbMod.update(r(p), clean(o) || {}),
      remove: p => dbMod.remove(r(p)),
      async reset() { await dbMod.remove(dbMod.ref(db, "rooms/" + room)); },
      on(p, cb) { return dbMod.onValue(r(p), s => cb(s.val())); },
      onConnection(cb) { dbMod.onValue(dbMod.ref(db, ".info/connected"), s => cb(!!s.val())); }
    };
  }

  async function openStore(mode, room) {
    if (mode === "firebase") {
      const cfg = window.FIREBASE_CONFIG;
      if (!cfg || !cfg.databaseURL) throw new Error("Chưa có cấu hình Firebase trong config.js");
      return FirebaseStore(cfg, room);
    }
    return LocalStore(room);
  }

  /* ---------- Âm thanh ngắn (Web Audio, không cần file) ---------- */
  let AC = null, muted = false;
  function ctx() {
    if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; } }
    if (AC && AC.state === "suspended") AC.resume();
    return AC;
  }
  function tone(f, d, type, vol, when) {
    if (muted) return; const c = ctx(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type || "sine"; o.frequency.value = f; o.connect(g); g.connect(c.destination);
    const t = c.currentTime + (when || 0);
    g.gain.setValueAtTime(vol || 0.08, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.start(t); o.stop(t + d + 0.02);
  }
  const sfx = {
    unlock: ctx,
    setMuted(m) { muted = m; },
    isMuted: () => muted,
    tick: () => tone(880, 0.07, "square", 0.03),
    good: () => { tone(523, 0.22, "sine", 0.1); tone(659, 0.22, "sine", 0.1, 0.11); tone(784, 0.4, "sine", 0.1, 0.22); },
    bad: () => tone(170, 0.5, "sawtooth", 0.07),
    coin: () => { tone(988, 0.08, "square", 0.05); tone(1319, 0.25, "square", 0.05, 0.08); },
    siren: () => { [0, 0.35, 0.7].forEach(t => { tone(660, 0.3, "triangle", 0.08, t); tone(880, 0.3, "triangle", 0.06, t + 0.17); }); },
    fanfare: () => [523, 659, 784, 1047].forEach((f, k) => tone(f, 0.4, "triangle", 0.1, k * 0.14))
  };

  const signed = d => (d > 0 ? "+" + d : d < 0 ? "−" + Math.abs(d) : "0");

  window.LHL = { CONFIG, PERKS, esc, uid, roomCode, openStore, sfx, signed };
})();
