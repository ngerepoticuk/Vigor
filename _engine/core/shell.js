/* shell.js — kerangka planner: sidebar berlabel + brand, topbar (Life Brain bar
   + command palette), settings (API key + Life Brain + 4 tema + data demo),
   router modul, auto-seed data demo saat pertama buka. */
window.Shell = (function () {
  var mods = {}, order = [], active = null, curUnmount = null, refs = {};
  var ICONMAP = {
    beranda: "layout-dashboard", kompas: "compass", sasaran: "target-arrow", ritme: "flame",
    fokus: "sun-high", jurnal: "feather", tinjau: "calendar-stats", skor: "gauge",
    // finance
    arus: "arrows-exchange", anggaran: "wallet", utang: "credit-card", impian: "pig-money", kekayaan: "trending-up",
    // wellness / fitness
    mood: "mood-smile", tidur: "moon", energi: "battery-charging", latihan: "barbell", tubuh: "scale", program: "clipboard-list", rekor: "trophy",
    // student
    jadwal: "calendar-time", tugas: "checklist", ujian: "school", belajar: "book", nilai: "chart-dots",
    // mom / family
    keluarga: "users-group", anak: "baby-carriage", menu: "chef-hat", waktuku: "heart-handshake",
    // business
    okr: "target", kpi: "chart-bar", ide: "bulb", pendapatan: "coin",
    // spiritual
    ibadah: "moon-stars", quran: "book-2", sedekah: "hand-love-you", muhasabah: "sparkles",
    // wedding
    hitungmundur: "hourglass", biaya: "wallet", vendor: "briefcase", tamu: "users", rundown: "timeline", checklist: "checklist",
    // content
    kalender: "calendar-event", ide2: "bulb", hook: "quote", repurpose: "recycle", performa: "chart-arrows-vertical"
  };

  function register(m) { mods[m.id] = m; }
  function label(id) { return (APP.labels && APP.labels[id]) || (mods[id] && mods[id].nama) || id; }
  function ctx() { return { brain: Brain, ai: AI, store: Store, ui: UI, intel: PIntel, go: go, shell: api, spec: APP.spec || {} }; }

  function themes() {
    var t = (APP.themes || []).slice();
    if (!t.length) t = [{ key: "bawaan", nama: "Bawaan", vars: (APP.tema && APP.tema.vars) || {} }];
    return t;
  }
  function themeByKey(k) { var t = themes(); for (var i = 0; i < t.length; i++) if (t[i].key === k) return t[i]; return t[0]; }

  function applyTheme() {
    var saved = Store.get("__theme", themes()[0].key);
    var th = themeByKey(saved);
    var base = (APP.tema && APP.tema.vars) || {};
    for (var k in base) document.documentElement.style.setProperty(k, base[k]);
    if (th.vars) for (var k2 in th.vars) document.documentElement.style.setProperty(k2, th.vars[k2]);
    var isLight = th.light != null ? th.light : (APP.tema && APP.tema.theme === "light");
    document.documentElement.setAttribute("data-theme", isLight ? "light" : "dark");
    document.documentElement.style.colorScheme = isLight ? "light" : "dark";
    document.title = APP.nama + " — " + (APP.tagline || "");
    var fav = document.querySelector("link[rel='icon']") || document.createElement("link");
    fav.rel = "icon"; fav.type = "image/svg+xml"; fav.href = (APP.logo && APP.logo.length) ? APP.logo : "assets/logo.svg";
    document.head.appendChild(fav);
  }
  function setTheme(key) { Store.set("__theme", key); applyTheme(); }

  function buildChrome() {
    var app = document.getElementById("app"); UI.clear(app);
    var logoSrc = (APP.logo && APP.logo.length) ? APP.logo : "assets/logo.svg";
    var brand = UI.el("div", { class: "brand" }, [
      UI.el("img", { class: "brand-logo", src: logoSrc, alt: APP.nama, onerror: function () { this.style.display = "none"; } }),
      UI.el("div", { class: "brand-txt" }, [UI.el("div", { class: "brand-name", text: APP.nama }), UI.el("div", { class: "brand-tag", text: APP.tagline || "" })])
    ]);
    refs.rail = UI.el("nav", { class: "nav" });
    function naviBtn(id) {
      var m = mods[id];
      return UI.el("button", { class: "navi", "data-id": id, onclick: function () { go(id); closeMobile(); } }, [
        UI.el("span", { class: "navi-ic" }, [UI.icon(m.icon || ICONMAP[id] || "circle")]),
        UI.el("span", { class: "navi-lbl", text: label(id) })
      ]);
    }
    var groups = APP.navGroups;
    if (groups && groups.length) {
      groups.forEach(function (grp) {
        var ids = (grp.ids || []).filter(function (id) { return mods[id] && order.indexOf(id) >= 0; });
        if (!ids.length) return;
        refs.rail.appendChild(UI.el("div", { class: "nav-sec", text: grp.label }));
        ids.forEach(function (id) { refs.rail.appendChild(naviBtn(id)); });
      });
      // modul yang belum masuk grup mana pun
      var grouped = {}; groups.forEach(function (g) { (g.ids || []).forEach(function (id) { grouped[id] = 1; }); });
      var rest = order.filter(function (id) { return !grouped[id]; });
      if (rest.length) { refs.rail.appendChild(UI.el("div", { class: "nav-sec", text: "Lainnya" })); rest.forEach(function (id) { refs.rail.appendChild(naviBtn(id)); }); }
    } else {
      refs.rail.appendChild(UI.el("div", { class: "nav-sec", text: "Menu" }));
      order.forEach(function (id) { refs.rail.appendChild(naviBtn(id)); });
    }
    var setBtn = UI.el("button", { class: "navi", onclick: openSettings }, [UI.el("span", { class: "navi-ic" }, [UI.icon("settings")]), UI.el("span", { class: "navi-lbl", text: "Pengaturan" })]);
    var sidebar = UI.el("aside", { class: "sidebar" }, [brand, refs.rail, UI.el("div", { class: "nav-foot" }, [setBtn])]);
    var overlay = UI.el("div", { class: "nav-overlay", onclick: closeMobile });

    refs.brain = UI.el("div", { class: "brainbar", onclick: openSettings });
    var burger = UI.el("button", { class: "burger", onclick: function () { document.body.classList.toggle("nav-open"); } }, [UI.icon("menu-2")]);
    refs.crumbMod = UI.el("b", { text: "" });
    var crumb = UI.el("div", { class: "crumb" }, [
      UI.el("span", { text: APP.nama }), UI.el("span", { class: "sep", text: "/" }), refs.crumbMod,
      UI.el("span", { class: "today", text: new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" }) })
    ]);
    var cmd = UI.el("button", { class: "cmdk", onclick: openPalette }, [UI.icon("search"), UI.el("span", {}, ["Cari modul atau aksi"]), UI.el("kbd", { text: (isMac() ? "⌘" : "Ctrl") + "K" })]);
    var topbar = UI.el("div", { class: "topbar" }, [burger, crumb, refs.brain, cmd]);
    refs.view = UI.el("main", { class: "view", id: "view" });
    var main = UI.el("div", { class: "main" }, [topbar, refs.view]);
    app.appendChild(UI.el("div", { class: "shell" }, [sidebar, overlay, main]));
    refreshBrain();
  }
  function closeMobile() { document.body.classList.remove("nav-open"); }

  function refreshBrain() {
    if (!refs.brain) return; UI.clear(refs.brain);
    var s = Brain.summary();
    refs.brain.appendChild(UI.el("span", { class: "pulse" }));
    if (s) { var parts = s.split(" · "); refs.brain.appendChild(UI.el("b", { text: parts[0] })); if (parts[1]) refs.brain.appendChild(UI.el("span", { class: "bb-niche", text: " · " + parts[1] })); }
    else refs.brain.appendChild(UI.el("span", { class: "bb-lbl bb-cta", text: "Atur profilmu →" }));
  }

  var nudged = false;
  function go(id) {
    if (!mods[id]) return;
    if (curUnmount) { try { curUnmount(); } catch (e) {} curUnmount = null; }
    active = id;
    Array.prototype.forEach.call(refs.rail.querySelectorAll(".navi"), function (b) { b.classList.toggle("on", b.getAttribute("data-id") === id); });
    if (refs.crumbMod) refs.crumbMod.textContent = label(id);
    UI.clear(refs.view); refs.view.scrollTop = 0;
    refs.view.style.animation = "none"; void refs.view.offsetWidth; refs.view.style.animation = "";
    if (!nudged && window.Notify) { nudged = true; var nd = Notify.nudge(); if (nd) refs.view.appendChild(nd); }
    var r = mods[id].mount(refs.view, ctx());
    curUnmount = (mods[id].unmount) || (r && r.unmount) || null;
  }

  function openPalette() {
    var items = order.map(function (id) { return { label: label(id), hint: "Modul", run: function () { go(id); } }; });
    items.push({ label: "Pengaturan & API Key", hint: "Aksi", run: openSettings });
    var list = UI.el("div", { class: "pal-list" });
    var input = UI.el("input", { class: "pal-input", placeholder: "Ketik untuk cari…" });
    function render(q) {
      UI.clear(list); q = (q || "").toLowerCase();
      items.filter(function (it) { return it.label.toLowerCase().indexOf(q) >= 0; }).forEach(function (it, i) {
        list.appendChild(UI.el("div", { class: "pal-row" + (i === 0 ? " sel" : ""), onclick: function () { m.close(); it.run(); } }, [UI.el("span", { text: it.label }), UI.el("span", { class: "pal-hint", text: it.hint })]));
      });
    }
    input.addEventListener("input", function () { render(input.value); });
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") { var sel = list.querySelector(".pal-row"); if (sel) sel.click(); } });
    render("");
    var m = UI.modal("Command Palette", UI.el("div", { class: "pal" }, [input, list]));
    setTimeout(function () { input.focus(); }, 50);
  }

  function openSettings() {
    var b = Brain.get(); var f = {};
    function fld(label, key, val, ph) { var inp = UI.el("input", { class: "input", placeholder: ph || "" }); inp.value = val || ""; f[key] = inp; return UI.el("label", { class: "fld" }, [UI.el("span", { text: label }), inp]); }
    var keyInp = UI.el("input", { class: "input", type: "password", placeholder: "Tempel API key Gemini" }); keyInp.value = Store.get("apikey", "");
    var body = UI.el("div", { class: "settings" }, [
      UI.el("div", { class: "set-sec" }, [UI.el("h4", { text: "API Key (Gemini — gratis)" }), UI.el("p", { class: "hint", html: 'Untuk fitur coach & saran AI. Gratis di <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener">aistudio.google.com/app/apikey</a>. Disimpan hanya di perangkat ini.' }), keyInp]),
      UI.el("div", { class: "set-sec" }, [UI.el("h4", { text: "Profilmu (Life Brain)" }), UI.el("p", { class: "hint", text: "Dipakai semua modul agar coaching AI terasa personal, bukan template." }),
        fld("Nama panggilan", "nama", b.diri.nama, "mis. Dinda"),
        fld("Peran / identitas", "peran", b.diri.peran, "mis. ibu 2 anak, freelancer"),
        fld("Tema hidupmu tahun ini", "musim", b.diri.musim, "mis. Tahun Bangkit & Sehat"),
        fld("Nilai inti (pisah koma)", "nilai", (b.nilai || []).join(", "), "keluarga, integritas, tumbuh"),
        fld("Fokus utama sekarang", "fokus", b.fokus, "mis. konsisten olahraga & nabung"),
        fld("Tantangan terbesar", "tantangan", b.tantangan, "mis. gampang menunda"),
        fld("Panggil aku dengan", "panggil", b.voice.panggil, "kamu / Anda"),
        fld("Nada coach", "nada", b.voice.nada, "hangat & jujur / tegas")]),
      UI.el("div", { class: "set-sec" }, [UI.el("h4", { text: "Tema tampilan" }), UI.el("p", { class: "hint", text: "4 suasana pilihan — langsung berubah, tersimpan di perangkat." }), themeGrid()]),
      window.Onboard ? UI.el("div", { class: "set-sec" }, [UI.el("h4", { text: "Mulai dari nol" }), UI.el("p", { class: "hint", text: "Bersihkan contoh dan siapkan planner-mu sendiri lewat setup terpandu 5 langkah." }),
        UI.el("button", { class: "btn btn-primary btn-sm", onclick: function () { m.close(); Onboard.start(); } }, [UI.icon("wand"), "Mulai Bersih (setup terpandu)"])]) : null,
      window.Notify ? UI.el("div", { class: "set-sec" }, [UI.el("h4", { text: "Pengingat harian" }), Notify.settingsSection()]) : null,
      UI.el("div", { class: "set-sec" }, [UI.el("h4", { text: "Pindah perangkat" }), UI.el("p", { class: "hint", text: "Bawa datamu ke HP/laptop lain — lewat kode atau QR, tetap 100% lokal." }),
        UI.el("div", { class: "row gap8" }, [
          UI.el("button", { class: "btn btn-ghost btn-sm", onclick: transferOut }, [UI.icon("qrcode"), "Kirim (kode/QR)"]),
          UI.el("button", { class: "btn btn-ghost btn-sm", onclick: transferIn }, [UI.icon("scan"), "Terima kode"])
        ])]),
      UI.el("div", { class: "set-sec" }, [UI.el("h4", { text: "Data & cadangan" }), UI.el("p", { class: "hint", text: "Planner terisi contoh agar langsung hidup. Kelola datamu di sini." }),
        UI.el("div", { class: "row gap8" }, [
          UI.el("button", { class: "btn btn-ghost btn-sm", onclick: backupData }, [UI.icon("download"), "Unduh cadangan"]),
          UI.el("button", { class: "btn btn-ghost btn-sm", onclick: restoreData }, [UI.icon("upload"), "Pulihkan"]),
          UI.el("button", { class: "btn btn-ghost btn-sm", text: "Reset ke contoh", onclick: function () { var k = Store.get("apikey", ""), th = Store.get("__theme"); Store.clearAll(); Store.set("apikey", k); if (th) Store.set("__theme", th); if (typeof window.SEED === "function") window.SEED(Store, Brain); Store.set("__seeded", 1); location.reload(); } }),
          UI.el("button", { class: "btn btn-danger btn-sm", text: "Kosongkan", onclick: function () { UI.confirm("Kosongkan semua data?", "Semua kebiasaan, sasaran, jurnal, catatan & tugas di perangkat ini akan dihapus.", function () { var k = Store.get("apikey", ""), th = Store.get("__theme"); Store.clearAll(); Store.set("apikey", k); if (th) Store.set("__theme", th); Store.set("__seeded", 1); location.reload(); }, { danger: true }); } })
        ])])
    ]);
    var save = UI.el("button", { class: "btn btn-primary", text: "Simpan" });
    body.appendChild(UI.el("div", { class: "set-foot" }, [save]));
    var m = UI.modal("Pengaturan", body, { wide: true });
    save.addEventListener("click", function () {
      Store.set("apikey", keyInp.value.trim());
      var nb = Brain.get();
      nb.diri.nama = f.nama.value.trim(); nb.diri.peran = f.peran.value.trim(); nb.diri.musim = f.musim.value.trim();
      nb.nilai = f.nilai.value.split(",").map(function (s) { return s.trim(); }).filter(Boolean);
      nb.fokus = f.fokus.value.trim(); nb.tantangan = f.tantangan.value.trim();
      nb.voice.panggil = f.panggil.value.trim() || "kamu"; nb.voice.nada = f.nada.value.trim() || "hangat & jujur";
      Brain.set(nb); refreshBrain(); UI.toast("Tersimpan", "ok"); m.close(); if (active) go(active);
    });
  }

  /* ---- pindah perangkat: kode base64 + QR (lib QR via CDN saat dibutuhkan) ---- */
  function dumpB64() {
    var dump = {}; Store.keys().forEach(function (k) { try { dump[k] = JSON.parse(localStorage.getItem(k)); } catch (e) {} });
    return btoa(unescape(encodeURIComponent(JSON.stringify({ app: APP.id, v: 1, data: dump }))));
  }
  function transferOut() {
    var code = dumpB64();
    var ta = UI.el("textarea", { class: "input", rows: 4, readonly: "readonly" }); ta.value = code;
    var qrBox = UI.el("div", { class: "tc", style: "margin-top:14px" });
    var body = UI.el("div", {}, [
      UI.el("p", { class: "hint", text: "Di perangkat baru: buka app yang sama → Pengaturan → Terima kode → tempel kode ini (atau scan QR)." }),
      UI.el("button", { class: "btn btn-primary btn-sm", style: "margin-bottom:10px", onclick: function () { ta.select(); document.execCommand("copy"); try { navigator.clipboard.writeText(code); } catch (e) {} UI.toast("Kode disalin ✓", "ok"); } }, [UI.icon("copy"), "Salin kode"]),
      ta, qrBox
    ]);
    UI.modal("Kirim Data", body, { wide: true });
    if (code.length <= 2300) {
      function draw() {
        try { var qr = window.qrcode(0, "M"); qr.addData(code); qr.make(); qrBox.innerHTML = qr.createSvgTag({ cellSize: 3, margin: 2 }); qrBox.firstChild.style.maxWidth = "240px"; qrBox.firstChild.style.height = "auto"; qrBox.firstChild.style.borderRadius = "12px"; }
        catch (e) { qrBox.appendChild(UI.el("div", { class: "hint", text: "QR tidak tersedia — pakai salin kode." })); }
      }
      if (window.qrcode) draw();
      else { var s = document.createElement("script"); s.src = "https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js"; s.onload = draw; s.onerror = function () { qrBox.appendChild(UI.el("div", { class: "hint", text: "QR butuh internet — pakai salin kode." })); }; document.head.appendChild(s); }
    } else qrBox.appendChild(UI.el("div", { class: "hint", text: "Data cukup besar untuk QR — gunakan salin kode atau file cadangan." }));
  }
  function transferIn() {
    var ta = UI.el("textarea", { class: "input", rows: 5, placeholder: "Tempel kode dari perangkat lama…" });
    var body = UI.el("div", {}, [UI.field("Kode data", ta)]);
    var go2 = UI.el("button", { class: "btn btn-primary", text: "Pulihkan" }); body.appendChild(UI.el("div", { class: "row", style: "justify-content:flex-end" }, [go2]));
    var m = UI.modal("Terima Data", body);
    go2.addEventListener("click", function () {
      try {
        var obj = JSON.parse(decodeURIComponent(escape(atob(ta.value.trim()))));
        var data = obj.data || obj;
        UI.confirm("Timpa data di perangkat ini?", "Data saat ini diganti dengan data dari kode.", function () {
          Object.keys(data).forEach(function (k) { try { localStorage.setItem(k, JSON.stringify(data[k])); } catch (e) {} });
          m.close(); UI.toast("Data dipindahkan ✓", "ok"); location.reload();
        });
      } catch (e) { UI.toast("Kode tidak valid", "err"); }
    });
  }

  function backupData() {
    var dump = {}; Store.keys().forEach(function (k) { try { dump[k] = JSON.parse(localStorage.getItem(k)); } catch (e) {} });
    var blob = new Blob([JSON.stringify({ app: APP.id, v: 1, t: Date.now(), data: dump }, null, 2)], { type: "application/json" });
    var a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = APP.nama.toLowerCase().replace(/\s+/g, "-") + "-cadangan-" + new Date().toISOString().slice(0, 10) + ".json";
    a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 500); UI.toast("Cadangan diunduh", "ok");
  }
  function restoreData() {
    var inp = document.createElement("input"); inp.type = "file"; inp.accept = "application/json";
    inp.onchange = function () {
      var file = inp.files[0]; if (!file) return; var r = new FileReader();
      r.onload = function () {
        try {
          var obj = JSON.parse(r.result); var data = obj.data || obj;
          UI.confirm("Pulihkan dari cadangan?", "Data saat ini akan diganti dengan isi file cadangan.", function () {
            Object.keys(data).forEach(function (k) { try { localStorage.setItem(k, JSON.stringify(data[k])); } catch (e) {} });
            UI.toast("Dipulihkan", "ok"); location.reload();
          });
        } catch (e) { UI.toast("File tidak valid", "err"); }
      };
      r.readAsText(file);
    };
    inp.click();
  }

  function themeGrid() {
    var wrap = UI.el("div", { class: "tgrid" });
    var cur = Store.get("__theme", themes()[0].key);
    themes().forEach(function (th) {
      var v = th.vars || (APP.tema && APP.tema.vars) || {};
      var sw = UI.el("button", { class: "tsw" + (th.key === cur ? " on" : ""), type: "button", onclick: function () {
        setTheme(th.key);
        Array.prototype.forEach.call(wrap.children, function (c) { c.classList.remove("on"); });
        sw.classList.add("on"); UI.toast("Tema: " + th.nama, "ok"); if (active) go(active);
      } }, [
        UI.el("span", { class: "tsw-dot", style: "background:linear-gradient(135deg," + (v["--bg"] || "#111") + " 48%," + (v["--primary"] || "#888") + " 52%)" }),
        UI.el("span", { class: "tsw-lbl", text: th.nama })
      ]);
      wrap.appendChild(sw);
    });
    return wrap;
  }

  function isMac() { return /Mac|iPhone|iPad/.test(navigator.platform); }

  function init() {
    applyTheme();
    order = (APP.modul || Object.keys(mods)).filter(function (id) { return mods[id]; });
    if (!Store.get("__seeded") && typeof window.SEED === "function") { try { window.SEED(Store, Brain); } catch (e) {} Store.set("__seeded", 1); }
    buildChrome();
    if (order.length) go(order[0]);
    document.addEventListener("keydown", function (e) { if ((e.metaKey || e.ctrlKey) && String(e.key).toLowerCase() === "k") { e.preventDefault(); openPalette(); } });
    if (window.Fab) try { Fab.init(); } catch (e) {}
    if (window.Coach) try { Coach.init(); } catch (e) {}
    if (window.Notify) try { Notify.startLoop(); } catch (e) {}
    // PWA: daftar service worker (hanya jalan lewat http/https, bukan file://)
    if ("serviceWorker" in navigator && /^https?:/.test(location.protocol)) {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    }
  }

  var api = { register: register, go: go, openSettings: openSettings, refreshBrain: refreshBrain };
  document.addEventListener("DOMContentLoaded", init);
  return api;
})();
