/* pustaka.js — Perpustakaan: paket kebiasaan & template sasaran siap-pasang
   (dari spec per-niche + generik). Sekali klik terpasang ke Ritme / Sasaran. */
window.Shell.register({
  id: "pustaka", nama: "Pustaka", icon: "books",
  mount: function (root, ctx) {
    var UI = ctx.ui, S = ctx.store, spec = ctx.spec;
    var tab = "habit";

    function render() {
      UI.clear(root);
      root.appendChild(UI.viewHead("Perpustakaan Template", "Pasang cepat", null));
      var seg = UI.el("div", { class: "seg", style: "margin-bottom:20px" });
      [["habit", "Paket Kebiasaan", "flame"], ["goal", "Template Sasaran", "target-arrow"]].forEach(function (x) {
        seg.appendChild(UI.el("button", { class: tab === x[0] ? "on" : "", onclick: function () { tab = x[0]; render(); } }, [UI.icon(x[2]), x[1]]));
      });
      root.appendChild(seg);
      var body = UI.el("div", {}); root.appendChild(body);
      (tab === "habit" ? habitPacks : goalTpls)(body);
    }

    function domLabel(k) { var d = (spec.domains || []).filter(function (x) { return x.key === k; })[0]; return d ? d.label : ""; }
    function domColor(k) { var d = (spec.domains || []).filter(function (x) { return x.key === k; })[0]; return d ? d.color : "var(--primary)"; }

    function habitPacks(body) {
      var packs = (spec.habitPacks || []).concat(GENERIC_HABITS);
      body.appendChild(UI.el("p", { class: "hint", text: "Paket kebiasaan berbasis area hidupmu. Pilih beberapa saja — konsistensi menang atas jumlah." }));
      var grid = UI.el("div", { class: "grid2", style: "margin-top:14px" });
      packs.forEach(function (p) {
        var card = UI.el("div", { class: "pk-card" });
        card.appendChild(UI.el("div", { class: "pk-head" }, [
          UI.el("div", { class: "pk-ic", style: "background:" + (p.warna || "var(--primary)") }, [UI.icon(p.icon || "flame")]),
          UI.el("div", { style: "flex:1" }, [UI.el("div", { class: "pk-t", text: p.nama }), UI.el("div", { class: "hint", style: "margin:2px 0 0", text: p.habits.length + " kebiasaan" })])
        ]));
        var ul = UI.el("div", { class: "pk-items" });
        p.habits.forEach(function (h) { ul.appendChild(UI.el("div", { class: "pk-item" }, [UI.el("span", { class: "pk-dot", style: "background:" + domColor(h.domain) }), UI.el("span", { style: "flex:1", text: h.nama }), UI.el("span", { class: "hint", style: "margin:0", text: domLabel(h.domain) })])); });
        card.appendChild(ul);
        card.appendChild(UI.el("button", { class: "btn btn-primary btn-sm", style: "margin-top:12px", onclick: function () { p.habits.forEach(function (h) { S.push("habits", { id: uid(), nama: h.nama, domain: h.domain, target: h.target || 7, aktif: true }); }); UI.toast(p.habits.length + " kebiasaan dipasang ✓", "ok"); ctx.go("ritme"); } }, [UI.icon("download"), "Pasang paket"]));
        grid.appendChild(card);
      });
      body.appendChild(grid);
    }

    function goalTpls(body) {
      var tpls = (spec.goalTemplates || []).concat(GENERIC_GOALS);
      body.appendChild(UI.el("p", { class: "hint", text: "Template sasaran lengkap dengan langkah-langkahnya. Pasang, lalu sesuaikan." }));
      var grid = UI.el("div", { class: "grid2", style: "margin-top:14px" });
      tpls.forEach(function (g) {
        var col = domColor(g.domain);
        var card = UI.el("div", { class: "pk-card" });
        card.appendChild(UI.el("div", { class: "flex center gap8", style: "margin-bottom:8px" }, [g.domain ? UI.tag(domLabel(g.domain), col) : null, UI.el("span", { class: "hint", style: "margin:0", text: horLabel(g.horizon) })]));
        card.appendChild(UI.el("div", { class: "pk-t", text: g.judul }));
        var ul = UI.el("div", { class: "pk-items", style: "margin-top:8px" });
        (g.sub || []).forEach(function (s) { ul.appendChild(UI.el("div", { class: "pk-item" }, [UI.icon("point"), UI.el("span", { text: s })])); });
        card.appendChild(ul);
        card.appendChild(UI.el("button", { class: "btn btn-primary btn-sm", style: "margin-top:12px", onclick: function () { S.push("goals", { id: uid(), judul: g.judul, horizon: g.horizon || "kuartal", domain: g.domain || "", progress: 0, sub: (g.sub || []).map(function (t) { return { t: t, done: false }; }), status: "aktif" }); UI.toast("Sasaran dipasang ✓", "ok"); ctx.go("sasaran"); } }, [UI.icon("download"), "Pasang sasaran"]));
        grid.appendChild(card);
      });
      body.appendChild(grid);
    }
    function horLabel(h) { return { minggu: "Minggu", bulan: "Bulan", kuartal: "3 bulan", tahun: "Tahun" }[h] || "Kuartal"; }

    var d0 = ((spec.domains || [])[0] || {}).key || "", d1 = ((spec.domains || [])[1] || {}).key || d0;
    var GENERIC_HABITS = [
      { nama: "Fondasi Pagi", icon: "sunrise", warna: "#fbbf24", habits: [{ nama: "Bangun jam tetap", domain: d0 }, { nama: "Minum air saat bangun", domain: d0 }, { nama: "Gerak badan 10 menit", domain: d0 }] },
      { nama: "Fokus & Kerja Dalam", icon: "brain", warna: "#38bdf8", habits: [{ nama: "Deep work 60 menit", domain: d1 }, { nama: "Satu hal penting sebelum HP", domain: d1 }, { nama: "Tutup semua tab tak perlu", domain: d1 }] },
      { nama: "Tenang Sebelum Tidur", icon: "moon", warna: "#a78bfa", habits: [{ nama: "Tulis 3 syukur", domain: d0 }, { nama: "Baca 10 halaman", domain: d1 }, { nama: "Layar mati 30 menit sebelum tidur", domain: d0 }] }
    ];
    var GENERIC_GOALS = [
      { judul: "Bangun kebiasaan olahraga 90 hari", domain: d0, horizon: "kuartal", sub: ["Pilih 1 jenis olahraga", "Jadwalkan 3×/minggu", "Siapkan perlengkapan malam sebelumnya", "Catat tiap sesi", "Evaluasi tiap 2 minggu"] },
      { judul: "Rapikan keuangan pribadi", domain: d1, horizon: "kuartal", sub: ["Catat semua pengeluaran 1 bulan", "Buat anggaran sederhana", "Sisihkan tabungan otomatis", "Lunasi 1 utang kecil", "Bangun dana darurat awal"] }
    ];

    render();
  }
});
