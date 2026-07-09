/* jadwalkeluarga.js — SIGNATURE Nara: agenda keluarga (sekolah, les, imunisasi,
   kontrol dokter) per anggota + minggu ini. Data: sig_famagenda. */
(window.SIG_SEEDERS = window.SIG_SEEDERS || []).push(function (S, spec, u) {
  if (spec.kind !== "mom") return;
  var a = [
    { siapa: "Si Kecil", teks: "Les renang", due: 1, warna: "#38bdf8" },
    { siapa: "Si Kecil", teks: "Imunisasi booster", due: 6, warna: "#34d399" },
    { siapa: "Ayah", teks: "Antar service mobil", due: 3, warna: "#fbbf24" },
    { siapa: "Keluarga", teks: "Makan bersama kakek-nenek", due: 5, warna: "#c2708a" }
  ];
  S.set("sig_famagenda", a.map(function (x, i) { return { id: u.id() + i, siapa: x.siapa, teks: x.teks, iso: u.iso(u.shift(x.due)), warna: x.warna, done: false }; }));
});
window.Shell.register({
  id: "jadwalkeluarga", nama: "Agenda Keluarga", icon: "calendar-heart",
  mount: function (root, ctx) {
    var UI = ctx.ui, S = ctx.store;
    function all() { return S.get("sig_famagenda", []); }
    function daysTo(iso) { return Math.round((new Date(iso) - new Date().setHours(0, 0, 0, 0)) / 864e5); }

    function render() {
      UI.clear(root);
      var arr = all().slice().sort(function (a, b) { return a.iso < b.iso ? -1 : 1; });
      root.appendChild(UI.viewHead("Agenda Keluarga", "Keluarga", UI.el("button", { class: "btn btn-primary", onclick: function () { edit(null); } }, [UI.icon("plus"), "Agenda"])));
      if (!arr.length) { root.appendChild(UI.empty("Belum ada agenda keluarga.<br>Catat jadwal sekolah, les, imunisasi, kontrol dokter — semua anggota, satu tempat.", UI.el("button", { class: "btn btn-primary", onclick: function () { edit(null); } }, [UI.icon("plus"), "Tambah agenda"]))); return; }
      var week = arr.filter(function (x) { var d = daysTo(x.iso); return !x.done && d >= 0 && d <= 7; });
      root.appendChild(UI.el("div", { class: "cards", style: "margin-bottom:18px" }, [
        UI.statCard({ label: "Minggu ini", value: week.length, icon: "calendar-week" }),
        UI.statCard({ label: "Total agenda", value: arr.filter(function (x) { return !x.done; }).length, icon: "calendar-heart" }),
        UI.statCard({ label: "Anggota", value: Object.keys(arr.reduce(function (m, x) { m[x.siapa] = 1; return m; }, {})).length, icon: "users-group" })
      ]));
      arr.filter(function (x) { return !x.done; }).forEach(function (x) { root.appendChild(row(x)); });
      var done = arr.filter(function (x) { return x.done; });
      if (done.length) { root.appendChild(UI.el("div", { class: "kick", style: "margin-top:18px", text: "Selesai" })); done.slice(0, 6).forEach(function (x) { root.appendChild(row(x)); }); }
    }
    function row(x) {
      var d = daysTo(x.iso);
      return UI.el("div", { class: "hrow" + (x.done ? " tk-done" : "") }, [
        UI.el("span", { class: "avatar", style: "background:" + (x.warna || "var(--primary)") + ";color:#fff", text: (x.siapa[0] || "?").toUpperCase() }),
        UI.el("div", { style: "flex:1;min-width:0" }, [
          UI.el("div", { class: "hname", text: x.teks }),
          UI.el("div", { class: "hmeta" }, [UI.el("span", { text: x.siapa }), UI.el("span", { style: (!x.done && d <= 1) ? "color:var(--danger);font-weight:700" : "", text: "📅 " + UI.fmtDate(x.iso, true) + (!x.done ? (d === 0 ? " (hari ini!)" : d === 1 ? " (besok)" : d > 0 ? " (" + d + " hari)" : " (lewat)") : "") })])
        ]),
        !x.done ? UI.el("button", { class: "btn btn-ghost btn-sm", onclick: function () { x.done = true; S.update("sig_famagenda", x.id, x); render(); UI.toast("Beres ✓", "ok"); } }, [UI.icon("check"), "Beres"]) : null,
        UI.el("button", { class: "btn btn-ghost btn-icon", onclick: function () { edit(x); } }, [UI.icon("dots")])
      ]);
    }
    function edit(x) {
      var isNew = !x; x = x || { id: uid(), siapa: "", teks: "", iso: UI.todayISO(), warna: "#c2708a", done: false };
      var siapa = UI.input({ val: x.siapa, ph: "mis. Kakak / Adik / Ayah / Keluarga" });
      var teks = UI.input({ val: x.teks, ph: "mis. Les piano" });
      var tgl = UI.input({ type: "date", val: x.iso });
      var body = UI.el("div", {}, [UI.field("Agenda", teks), UI.el("div", { class: "grid2" }, [UI.field("Untuk siapa", siapa), UI.field("Tanggal", tgl)])]);
      var save = UI.el("button", { class: "btn btn-primary", text: isNew ? "Tambah" : "Simpan" });
      var del = isNew ? null : UI.el("button", { class: "btn btn-danger", text: "Hapus" });
      body.appendChild(UI.el("div", { class: "row", style: "justify-content:space-between;margin-top:6px" }, [del || UI.el("span"), save]));
      var m = UI.modal(isNew ? "Agenda Baru" : "Edit Agenda", body);
      save.addEventListener("click", function () { if (!teks.value.trim()) { UI.toast("Isi agenda", "err"); return; } x.teks = teks.value.trim(); x.siapa = siapa.value.trim() || "Keluarga"; x.iso = tgl.value; if (isNew) S.push("sig_famagenda", x); else S.update("sig_famagenda", x.id, x); m.close(); render(); });
      if (del) del.addEventListener("click", function () { m.close(); UI.confirm("Hapus agenda?", "", function () { S.remove("sig_famagenda", x.id); render(); }, { danger: true }); });
    }
    render();
  }
});
