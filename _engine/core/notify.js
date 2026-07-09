/* notify.js — pengingat harian: jam custom (pagi/siang/malam) + notifikasi
   browser (saat app terbuka / PWA) + nudge dalam-app. Data: __reminders. */
window.Notify = (function () {
  var DEF = { on: false, times: [{ label: "Pagi", jam: "05:30", on: true }, { label: "Siang", jam: "12:30", on: false }, { label: "Malam", jam: "20:30", on: true }] };
  function cfg() { return Store.get("__reminders", null) || JSON.parse(JSON.stringify(DEF)); }
  function save(c) { Store.set("__reminders", c); }

  function permitted() { return ("Notification" in window) && Notification.permission === "granted"; }
  async function askPermission() {
    if (!("Notification" in window)) { UI.toast("Browser tidak mendukung notifikasi", "err"); return false; }
    var p = await Notification.requestPermission();
    return p === "granted";
  }
  function fire(title, body) {
    try { if (permitted()) new Notification(title, { body: body, icon: "assets/logo.svg", badge: "assets/logo.svg" }); } catch (e) {}
  }

  /* loop pengecekan tiap menit saat app terbuka */
  var timer = null;
  function startLoop() {
    if (timer) clearInterval(timer);
    timer = setInterval(function () {
      var c = cfg(); if (!c.on || !permitted()) return;
      var now = new Date(); var hm = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
      var today = now.toISOString().slice(0, 10);
      var fired = Store.get("__remfired", {});
      c.times.forEach(function (t, i) {
        if (!t.on || t.jam !== hm) return;
        var key = today + ":" + i;
        if (fired[key]) return;
        fired[key] = 1; Store.set("__remfired", fired);
        var msgs = {
          Pagi: "Waktunya rutinitas pagi — mulai harimu dengan menang kecil ☀️",
          Siang: "Cek prioritasmu — masih di jalur? 🚀",
          Malam: "Tutup harimu: centang kebiasaan & tulis jurnal 🌙"
        };
        fire(APP.nama + " — " + t.label, msgs[t.label] || "Waktunya membuka planner-mu.");
      });
    }, 30000);
  }

  /* nudge dalam-app: banner di atas view kalau lama tak aktif / belum cek hari ini */
  function nudge(ctx) {
    try {
      var last = Store.get("__lastopen", null);
      var today = new Date().toISOString().slice(0, 10);
      var gap = last ? Math.round((new Date(today) - new Date(last)) / 864e5) : 0;
      Store.set("__lastopen", today);
      if (gap >= 3) {
        return UI.el("div", { class: "nudge" }, [
          UI.icon("heart-handshake"),
          UI.el("span", { style: "flex:1", html: "Senang kamu kembali! Sudah <b>" + gap + " hari</b> — tak apa, yang penting hari ini muncul lagi. Mulai kecil saja. 💛" }),
          UI.el("button", { class: "nudge-x", text: "✕", onclick: function (e) { e.target.closest(".nudge").remove(); } })
        ]);
      }
    } catch (e) {}
    return null;
  }

  /* UI pengaturan pengingat (dipasang di Settings) */
  function settingsSection() {
    var c = cfg();
    var wrap = UI.el("div", {});
    var master = UI.el("button", { class: "ob-toggle" + (c.on ? " on" : ""), onclick: async function () {
      if (!c.on) { var ok = await askPermission(); if (!ok) { UI.toast("Izin notifikasi ditolak browser", "err"); return; } }
      c.on = !c.on; save(c); master.classList.toggle("on"); UI.toast(c.on ? "Pengingat aktif 🔔" : "Pengingat mati", "ok");
    } }, [UI.el("span", { class: "ob-toggle-sw" })]);
    wrap.appendChild(UI.el("div", { class: "flex between center", style: "margin-bottom:12px" }, [
      UI.el("div", {}, [UI.el("b", { text: "Notifikasi pengingat" }), UI.el("div", { class: "hint", style: "margin:2px 0 0", text: "Muncul saat app/PWA terbuka di jam yang kamu pilih." })]), master
    ]));
    c.times.forEach(function (t, i) {
      var tgl = UI.el("button", { class: "ob-toggle" + (t.on ? " on" : ""), style: "transform:scale(.85)", onclick: function () { t.on = !t.on; save(c); tgl.classList.toggle("on"); } }, [UI.el("span", { class: "ob-toggle-sw" })]);
      var jam = UI.el("input", { class: "input", type: "time", value: t.jam, style: "width:110px;padding:7px 10px" });
      jam.addEventListener("change", function () { t.jam = jam.value; save(c); });
      wrap.appendChild(UI.el("div", { class: "flex center gap12", style: "padding:7px 0" }, [tgl, UI.el("span", { style: "width:56px;font-weight:600;font-size:13.5px", text: t.label }), jam]));
    });
    return wrap;
  }

  return { cfg: cfg, save: save, startLoop: startLoop, nudge: nudge, settingsSection: settingsSection, fire: fire, askPermission: askPermission };
})();
