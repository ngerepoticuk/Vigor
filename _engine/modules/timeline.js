/* timeline.js — SIGNATURE Ikrar (Mahligai-style): checklist persiapan nikah
   per FASE waktu (12+ bln → hari-H) + progres + countdown. Data: sig_timeline. */
(window.SIG_SEEDERS = window.SIG_SEEDERS || []).push(function (S, spec, u) {
  if (spec.kind !== "wedding") return;
  var DEF = defaultPhases();
  // tandai beberapa awal sudah selesai biar terasa hidup
  DEF[0].items.forEach(function (it, i) { if (i < 3) it.done = true; });
  DEF[1].items.forEach(function (it, i) { if (i < 2) it.done = true; });
  S.set("sig_timeline", { phases: DEF });
  if (!S.get("sig_wedding")) { var wd = new Date(); wd.setDate(wd.getDate() + 96); S.set("sig_wedding", { date: wd.toISOString().slice(0, 10) }); }
});
function defaultPhases() {
  function P(nama, ket, items) { return { nama: nama, ket: ket, items: items.map(function (t) { return { t: t, done: false }; }) }; }
  return [
    P("12+ Bulan", "Fondasi", ["Sepakati konsep & tanggal bersama pasangan", "Tetapkan anggaran total", "Susun daftar tamu kasar", "Survei & booking venue", "Booking vendor inti (foto, dekor, katering)"]),
    P("6–12 Bulan", "Vendor utama", ["Pilih & DP MUA + busana", "Pilih katering & menu tasting", "Tentukan tema & palet warna", "Booking fotografer & videografer", "Rencana honeymoon"]),
    P("3–6 Bulan", "Detail", ["Fitting baju pengantin", "Desain & cetak undangan", "Finalisasi dekorasi", "Susun rundown acara", "Siapkan seserahan / hantaran", "Kelas / bimbingan pranikah"]),
    P("1–3 Bulan", "Finalisasi", ["Sebar undangan", "Konfirmasi ulang semua vendor", "Fitting akhir busana", "Siapkan mahar & cincin", "Urus dokumen (KUA/catatan sipil)", "Buat kelompok koordinasi (WA panitia)"]),
    P("1 Bulan", "Persiapan akhir", ["Rekap RSVP tamu", "Bayar pelunasan vendor", "Gladi bersih / technical meeting", "Siapkan perlengkapan hari-H (kotak darurat)", "Istirahat & rawat diri"]),
    P("Minggu Hari-H", "Eksekusi", ["Konfirmasi timeline ke semua pihak", "Serahkan tugas ke koordinator", "Manikur/pedikur & perawatan", "Packing untuk honeymoon", "Nikmati & bersyukur — hari kalian tiba!"])
  ];
}
window.Shell.register({
  id: "timeline", nama: "Timeline Nikah", icon: "timeline",
  mount: function (root, ctx) {
    var UI = ctx.ui, S = ctx.store;
    function data() { var d = S.get("sig_timeline", null); if (!d) { d = { phases: defaultPhases() }; S.set("sig_timeline", d); } return d; }
    function save(d) { S.set("sig_timeline", d); }

    function render() {
      UI.clear(root);
      var d = data();
      var allItems = d.phases.reduce(function (a, p) { return a.concat(p.items); }, []);
      var done = allItems.filter(function (i) { return i.done; }).length, tot = allItems.length;
      var pct = tot ? Math.round(done / tot * 100) : 0;
      var wd = S.get("sig_wedding", {});
      var days = wd.date ? Math.ceil((new Date(wd.date) - new Date().setHours(0, 0, 0, 0)) / 864e5) : null;

      root.appendChild(UI.viewHead("Timeline Persiapan", "Pernikahan", UI.el("button", { class: "btn btn-ghost", onclick: setDate }, [UI.icon("calendar"), wd.date ? "Ubah hari-H" : "Set hari-H"])));
      root.appendChild(UI.el("section", { class: "hero", style: "margin-bottom:18px" }, [
        UI.el("div", { class: "hero-row" }, [
          UI.el("div", { style: "flex:1;min-width:220px" }, [
            UI.el("div", { class: "kick", text: days != null && days >= 0 ? days + " hari menuju hari bahagia" : "Persiapan pernikahan" }),
            UI.el("h1", { class: "h1", text: done + " dari " + tot + " tugas beres" }),
            UI.el("div", { class: "sub", text: pct >= 100 ? "Semua siap — tinggal menikmati hari kalian! 💍" : "Ceklis tiap tugas sesuai fasenya. Tenang, satu per satu." }),
            UI.el("div", { style: "margin-top:14px;max-width:360px" }, [UI.progress(pct)])
          ]),
          UI.el("div", { style: "flex:none" }, [UI.ringz(pct, { size: 120, of: "kesiapan", label: pct + "%" })])
        ])
      ]));

      d.phases.forEach(function (p, pi) {
        var pd = p.items.filter(function (i) { return i.done; }).length;
        var card = UI.el("div", { class: "panel", style: "margin-bottom:14px" });
        card.appendChild(UI.el("div", { class: "flex between center", style: "margin-bottom:10px" }, [
          UI.el("div", { class: "flex center gap12" }, [
            UI.el("div", { class: "tl-badge", text: (pi + 1) }),
            UI.el("div", {}, [UI.el("div", { class: "panel-t", style: "margin:0", text: p.nama }), UI.el("div", { class: "hint", style: "margin:0", text: p.ket + " · " + pd + "/" + p.items.length })])
          ]),
          UI.el("div", { style: "width:120px" }, [UI.progress(p.items.length ? Math.round(pd / p.items.length * 100) : 0, { sm: true })])
        ]));
        p.items.forEach(function (it, ii) {
          card.appendChild(UI.el("div", { class: "sub-item" + (it.done ? " done" : "") }, [
            UI.el("button", { class: "hcheck", style: "width:24px;height:24px;border-radius:8px", onclick: function () { it.done = !it.done; save(d); render(); } }, [it.done ? UI.icon("check") : null]),
            UI.el("span", { style: "flex:1", text: it.t }),
            UI.el("span", { class: "hint", style: "margin:0;cursor:pointer", text: "✕", onclick: function () { p.items.splice(ii, 1); save(d); render(); } })
          ]));
        });
        var add = UI.input({ ph: "+ tambah tugas di fase ini, Enter" }); add.style.marginTop = "8px";
        add.addEventListener("keydown", function (e) { if (e.key === "Enter" && add.value.trim()) { p.items.push({ t: add.value.trim(), done: false }); save(d); render(); } });
        card.appendChild(add);
        root.appendChild(card);
      });
    }
    function setDate() {
      var wd = S.get("sig_wedding", {}); var inp = UI.input({ type: "date", val: wd.date || "" });
      var body = UI.el("div", {}, [UI.field("Tanggal pernikahan", inp)]);
      var save2 = UI.el("button", { class: "btn btn-primary", text: "Simpan" }); body.appendChild(UI.el("div", { class: "row", style: "justify-content:flex-end" }, [save2]));
      var m = UI.modal("Tanggal Hari-H", body);
      save2.addEventListener("click", function () { S.set("sig_wedding", { date: inp.value }); m.close(); render(); });
    }
    render();
  }
});
