/* anggaran.js — SIGNATURE Saldo: anggaran amplop (kategori: budget vs terpakai)
   + catat transaksi. Data: sig_budget {cats:[{id,nama,budget,warna}], tx:[]}. */
(window.SIG_SEEDERS = window.SIG_SEEDERS || []).push(function (S, spec, u) {
  var cats, pakai;
  if (spec.kind === "finance") {
    cats = [
      { id: u.id() + "c1", nama: "Makan & Dapur", budget: 2000000, warna: "#12b981" },
      { id: u.id() + "c2", nama: "Transportasi", budget: 700000, warna: "#38bdf8" },
      { id: u.id() + "c3", nama: "Hiburan", budget: 500000, warna: "#f26d84" },
      { id: u.id() + "c4", nama: "Tagihan", budget: 1200000, warna: "#fbbf24" }
    ];
    pakai = [1350000, 480000, 320000, 1200000];
  } else if (spec.kind === "wedding") {
    cats = [
      { id: u.id() + "c1", nama: "Venue & Gedung", budget: 35000000, warna: "#d9b48a" },
      { id: u.id() + "c2", nama: "Katering", budget: 42000000, warna: "#fbbf24" },
      { id: u.id() + "c3", nama: "Dekorasi", budget: 18000000, warna: "#9caf88" },
      { id: u.id() + "c4", nama: "Foto & Video", budget: 12000000, warna: "#38bdf8" },
      { id: u.id() + "c5", nama: "MUA & Busana", budget: 9000000, warna: "#e79ab0" },
      { id: u.id() + "c6", nama: "Undangan & Souvenir", budget: 6000000, warna: "#a78bfa" }
    ];
    pakai = [10000000, 15000000, 5000000, 12000000, 0, 2000000];
  } else return;
  var tx = [];
  cats.forEach(function (c, i) { if (pakai[i]) tx.push({ id: u.id() + "t" + i, catId: c.id, jumlah: pakai[i], teks: spec.kind === "wedding" ? "DP/bayar " + c.nama : "Pengeluaran " + c.nama, iso: u.iso(u.shift(-(i + 1))) }); });
  S.set("sig_budget", { cats: cats, tx: tx });
});
window.Shell.register({
  id: "anggaran", nama: "Anggaran", icon: "wallet",
  mount: function (root, ctx) {
    var UI = ctx.ui, S = ctx.store;
    function data() { return S.get("sig_budget", { cats: [], tx: [] }); }
    function save(d) { S.set("sig_budget", d); }
    function spent(d, catId) { return d.tx.filter(function (t) { return t.catId === catId; }).reduce(function (a, t) { return a + (+t.jumlah || 0); }, 0); }

    function render() {
      UI.clear(root);
      var d = data();
      root.appendChild(UI.viewHead("Anggaran Amplop", "Uang", UI.el("div", { class: "row gap8" }, [
        UI.el("button", { class: "btn btn-ghost", onclick: analisa }, [UI.icon("sparkles"), "Analisa AI"]),
        UI.el("button", { class: "btn btn-ghost", onclick: function () { editCat(null); } }, [UI.icon("plus"), "Kategori"]),
        UI.el("button", { class: "btn btn-primary", onclick: function () { addTx(); } }, [UI.icon("receipt"), "Catat"])
      ])));
      if (!d.cats.length) { root.appendChild(UI.empty("Belum ada kategori anggaran.<br>Buat amplop (mis. Makan, Transport) lalu catat pengeluaran.", UI.el("button", { class: "btn btn-primary", onclick: function () { editCat(null); } }, [UI.icon("plus"), "Buat kategori"]))); return; }
      var totBud = d.cats.reduce(function (a, c) { return a + c.budget; }, 0);
      var totPakai = d.cats.reduce(function (a, c) { return a + spent(d, c.id); }, 0);
      var sisa = totBud - totPakai;
      root.appendChild(UI.el("div", { class: "cards", style: "margin-bottom:18px" }, [
        UI.statCard({ label: "Total anggaran", value: totBud, fmt: UI.money, icon: "wallet" }),
        UI.statCard({ label: "Terpakai", value: totPakai, fmt: UI.money, icon: "arrow-down", color: "var(--danger)" }),
        UI.statCard({ label: "Sisa", value: sisa, fmt: UI.money, icon: "pig-money", color: sisa >= 0 ? "var(--ok)" : "var(--danger)" }),
        UI.statCard({ label: "Kategori", value: d.cats.length, icon: "layout-grid" })
      ]));
      var grid = UI.el("div", { class: "grid2" });
      d.cats.forEach(function (c) {
        var sp = spent(d, c.id), pct = c.budget ? Math.round(sp / c.budget * 100) : 0, over = sp > c.budget;
        var card = UI.el("div", { class: "panel" }, [
          UI.el("div", { class: "flex between center", style: "margin-bottom:4px" }, [
            UI.el("div", { class: "flex center gap8" }, [UI.el("span", { class: "pk-dot", style: "background:" + c.warna }), UI.el("div", { class: "panel-t", style: "margin:0", text: c.nama })]),
            UI.el("button", { class: "btn btn-ghost btn-icon", onclick: function () { editCat(c); } }, [UI.icon("dots")])
          ]),
          UI.el("div", { class: "hint", style: "margin:0 0 10px", text: UI.money(sp) + " dari " + UI.money(c.budget) + (over ? " · lebih " + UI.money(sp - c.budget) : " · sisa " + UI.money(c.budget - sp)) }),
          UI.progress(Math.min(100, pct), { color: over ? "var(--danger)" : c.warna }),
          UI.el("div", { style: "text-align:right;margin-top:6px;font-weight:700;font-size:12.5px;color:" + (over ? "var(--danger)" : "var(--muted)"), text: pct + "%" })
        ]);
        grid.appendChild(card);
      });
      root.appendChild(grid);
      // riwayat
      var recent = d.tx.slice().sort(function (a, b) { return a.iso < b.iso ? 1 : -1; }).slice(0, 8);
      if (recent.length) {
        var tbl = UI.el("table", { class: "tbl" }, [UI.el("tr", {}, [UI.el("th", { text: "Tanggal" }), UI.el("th", { text: "Kategori" }), UI.el("th", { text: "Catatan" }), UI.el("th", { class: "num", text: "Jumlah" }), UI.el("th", {})])]);
        recent.forEach(function (t) {
          var c = d.cats.filter(function (x) { return x.id === t.catId; })[0] || {};
          tbl.appendChild(UI.el("tr", {}, [UI.el("td", { text: UI.fmtDate(t.iso, true) }), UI.el("td", { text: c.nama || "-" }), UI.el("td", { text: t.teks || "" }), UI.el("td", { class: "num", text: UI.money(t.jumlah) }), UI.el("td", { class: "num" }, [UI.el("span", { style: "cursor:pointer;color:var(--muted)", text: "✕", onclick: function () { var dd = data(); dd.tx = dd.tx.filter(function (x) { return x.id !== t.id; }); save(dd); render(); } })])]));
        });
        root.appendChild(UI.el("div", { class: "sec" }, [UI.el("div", { class: "sec-head" }, [UI.el("h2", { class: "h2", text: "Transaksi terakhir" })]), UI.el("div", { class: "panel", style: "padding:6px 10px" }, [tbl])]));
      }
    }

    async function analisa() {
      if (!ctx.ai.hasKey()) { UI.toast("Isi API key dulu di Pengaturan", "err"); ctx.shell.openSettings(); return; }
      var box = UI.el("div", {}, [UI.spinner("Menganalisa pola pengeluaranmu…")]);
      var m = UI.modal("Analisa Keuangan AI", box, { wide: true });
      try {
        var d = data();
        var rows = d.cats.map(function (c) { return c.nama + ": pagu " + UI.money(c.budget) + ", terpakai " + UI.money(spent(d, c.id)); }).join("; ");
        var out = await ctx.ai.ask({
          system: ctx.brain.context() + "\nKamu penasihat keuangan pribadi yang membumi (bukan menghakimi). Balas maks 6 kalimat mengalir: pos paling berisiko jebol, 1 pola yang terlihat, 2 saran hemat konkret & realistis untuk konteks Indonesia, dan 1 apresiasi.",
          prompt: "Anggaranku bulan ini: " + rows + ". Analisa & beri saran.", temp: 0.8
        });
        UI.clear(box); box.appendChild(UI.briefing(UI.esc(out), { title: "Analisa Keuanganmu", icon: "wallet" }));
      } catch (e) { UI.clear(box); box.appendChild(UI.el("div", { class: "empty", text: e.message })); }
    }

    function addTx() {
      var d = data(); if (!d.cats.length) { UI.toast("Buat kategori dulu", "err"); return; }
      var cat = UI.select(d.cats.map(function (c) { return { v: c.id, l: c.nama }; }), d.cats[0].id);
      var jml = UI.input({ type: "number", ph: "0" });
      var teks = UI.input({ ph: "Catatan (opsional)" });
      var tgl = UI.input({ type: "date", val: UI.todayISO() });
      var body = UI.el("div", {}, [UI.field("Kategori", cat), UI.field("Jumlah (Rp)", jml), UI.field("Catatan", teks), UI.field("Tanggal", tgl)]);
      var save2 = UI.el("button", { class: "btn btn-primary", text: "Catat" }); body.appendChild(UI.el("div", { class: "row", style: "justify-content:flex-end;margin-top:6px" }, [save2]));
      var m = UI.modal("Catat Pengeluaran", body);
      save2.addEventListener("click", function () { if (!+jml.value) { UI.toast("Isi jumlah", "err"); return; } d.tx.push({ id: uid(), catId: cat.value, jumlah: +jml.value, teks: teks.value.trim(), iso: tgl.value }); save(d); m.close(); render(); UI.toast("Tercatat", "ok"); });
    }
    function editCat(c) {
      var d = data(), isNew = !c; c = c || { id: uid(), nama: "", budget: 0, warna: "#12b981" };
      var nama = UI.input({ val: c.nama, ph: "mis. Makan & Dapur" });
      var bud = UI.input({ type: "number", val: c.budget || "", ph: "0" });
      var body = UI.el("div", {}, [UI.field("Nama kategori", nama), UI.field("Anggaran / bulan (Rp)", bud)]);
      var save2 = UI.el("button", { class: "btn btn-primary", text: isNew ? "Tambah" : "Simpan" });
      var del = isNew ? null : UI.el("button", { class: "btn btn-danger", text: "Hapus" });
      body.appendChild(UI.el("div", { class: "row", style: "justify-content:space-between;margin-top:6px" }, [del || UI.el("span"), save2]));
      var m = UI.modal(isNew ? "Kategori Baru" : "Edit Kategori", body);
      save2.addEventListener("click", function () { if (!nama.value.trim()) { UI.toast("Isi nama", "err"); return; } c.nama = nama.value.trim(); c.budget = +bud.value || 0; var i = d.cats.map(function (x) { return x.id; }).indexOf(c.id); if (i >= 0) d.cats[i] = c; else d.cats.push(c); save(d); m.close(); render(); });
      if (del) del.addEventListener("click", function () { m.close(); UI.confirm("Hapus kategori?", "Transaksinya ikut terhapus.", function () { d.cats = d.cats.filter(function (x) { return x.id !== c.id; }); d.tx = d.tx.filter(function (x) { return x.catId !== c.id; }); save(d); render(); }, { danger: true }); });
    }
    render();
  }
});
