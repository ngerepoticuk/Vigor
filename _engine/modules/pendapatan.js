/* pendapatan.js — SIGNATURE Helm: arus kas bisnis (pemasukan/pengeluaran) +
   profit + tren bulanan. Data: sig_income [{id,iso,sumber,jumlah,tipe}]. */
(window.SIG_SEEDERS = window.SIG_SEEDERS || []).push(function (S, spec, u) {
  if (spec.kind !== "business") return;
  var arr = [];
  var masuk = [["Proyek klien A", 8000000], ["Penjualan produk", 3500000], ["Retainer bulanan", 5000000]];
  var keluar = [["Iklan & marketing", 1500000], ["Tools & langganan", 800000], ["Operasional", 1200000]];
  masuk.forEach(function (x, i) { arr.push({ id: u.id() + "m" + i, iso: u.iso(u.shift(-(i * 4 + 2))), sumber: x[0], jumlah: x[1], tipe: "masuk" }); });
  keluar.forEach(function (x, i) { arr.push({ id: u.id() + "k" + i, iso: u.iso(u.shift(-(i * 5 + 3))), sumber: x[0], jumlah: x[1], tipe: "keluar" }); });
  S.set("sig_income", arr);
});
window.Shell.register({
  id: "pendapatan", nama: "Arus Kas", icon: "coin",
  mount: function (root, ctx) {
    var UI = ctx.ui, S = ctx.store;
    function inc() { return S.get("sig_income", []); }
    function sum(arr, tipe) { return arr.filter(function (x) { return x.tipe === tipe; }).reduce(function (a, x) { return a + (+x.jumlah || 0); }, 0); }

    function render() {
      UI.clear(root);
      var arr = inc();
      root.appendChild(UI.viewHead("Arus Kas Bisnis", "Bisnis", UI.el("div", { class: "row gap8" }, [
        UI.el("button", { class: "btn btn-ghost", onclick: function () { add("keluar"); } }, [UI.icon("arrow-down"), "Pengeluaran"]),
        UI.el("button", { class: "btn btn-primary", onclick: function () { add("masuk"); } }, [UI.icon("arrow-up"), "Pemasukan"])
      ])));
      if (!arr.length) { root.appendChild(UI.empty("Belum ada catatan kas.<br>Catat pemasukan & pengeluaran bisnismu — profit dihitung otomatis.", UI.el("button", { class: "btn btn-primary", onclick: function () { add("masuk"); } }, [UI.icon("plus"), "Catat pemasukan"]))); return; }
      var masuk = sum(arr, "masuk"), keluar = sum(arr, "keluar"), profit = masuk - keluar;
      root.appendChild(UI.el("div", { class: "cards", style: "margin-bottom:18px" }, [
        UI.statCard({ label: "Total masuk", value: masuk, fmt: UI.money, icon: "arrow-up", color: "var(--ok)" }),
        UI.statCard({ label: "Total keluar", value: keluar, fmt: UI.money, icon: "arrow-down", color: "var(--danger)" }),
        UI.statCard({ label: "Laba bersih", value: profit, fmt: UI.money, icon: "trending-up", color: profit >= 0 ? "var(--ok)" : "var(--danger)" }),
        UI.statCard({ label: "Margin", value: masuk ? Math.round(profit / masuk * 100) : 0, fmt: function (v) { return Math.round(v) + "%"; }, icon: "percentage" })
      ]));
      // tren 6 bulan
      var months = {}; var now = new Date();
      for (var i = 5; i >= 0; i--) { var dt = new Date(now.getFullYear(), now.getMonth() - i, 1); months[dt.getFullYear() + "-" + dt.getMonth()] = { l: UI.BULAN[dt.getMonth()].slice(0, 3), m: 0, k: 0 }; }
      arr.forEach(function (x) { var dt = new Date(x.iso); var key = dt.getFullYear() + "-" + dt.getMonth(); if (months[key]) months[key][x.tipe === "masuk" ? "m" : "k"] += x.jumlah; });
      var bars = Object.keys(months).map(function (k) { return { label: months[k].l, val: months[k].m }; });
      root.appendChild(UI.el("div", { class: "panel", style: "margin-bottom:18px" }, [UI.el("div", { class: "panel-t", text: "Pemasukan 6 bulan" }), UI.el("div", { style: "height:140px;margin-top:14px" }, [UI.bars(bars, { h: 140 })])]));
      // riwayat
      var tbl = UI.el("table", { class: "tbl" }, [UI.el("tr", {}, [UI.el("th", { text: "Tanggal" }), UI.el("th", { text: "Sumber" }), UI.el("th", { text: "Tipe" }), UI.el("th", { class: "num", text: "Jumlah" }), UI.el("th", {})])]);
      arr.slice().sort(function (a, b) { return a.iso < b.iso ? 1 : -1; }).slice(0, 12).forEach(function (x) {
        tbl.appendChild(UI.el("tr", {}, [
          UI.el("td", { text: UI.fmtDate(x.iso, true) }), UI.el("td", {}, [UI.el("b", { text: x.sumber })]),
          UI.el("td", {}, [UI.tag(x.tipe === "masuk" ? "Masuk" : "Keluar", x.tipe === "masuk" ? "var(--ok)" : "var(--danger)")]),
          UI.el("td", { class: "num", style: "color:" + (x.tipe === "masuk" ? "var(--ok)" : "var(--danger)"), text: (x.tipe === "masuk" ? "+" : "−") + UI.money(x.jumlah).replace("Rp", "Rp ") }),
          UI.el("td", { class: "num" }, [UI.el("span", { style: "cursor:pointer;color:var(--muted)", text: "✕", onclick: function () { S.remove("sig_income", x.id); render(); } })])
        ]));
      });
      root.appendChild(UI.el("div", { class: "panel", style: "padding:6px 10px" }, [tbl]));
    }
    function add(tipe) {
      var sumber = UI.input({ ph: tipe === "masuk" ? "mis. Proyek klien" : "mis. Iklan" });
      var jml = UI.input({ type: "number", ph: "0" });
      var tgl = UI.input({ type: "date", val: UI.todayISO() });
      var body = UI.el("div", {}, [UI.field(tipe === "masuk" ? "Sumber pemasukan" : "Pos pengeluaran", sumber), UI.field("Jumlah (Rp)", jml), UI.field("Tanggal", tgl)]);
      var save = UI.el("button", { class: "btn btn-primary", text: "Catat" }); body.appendChild(UI.el("div", { class: "row", style: "justify-content:flex-end;margin-top:6px" }, [save]));
      var m = UI.modal(tipe === "masuk" ? "Pemasukan Baru" : "Pengeluaran Baru", body);
      save.addEventListener("click", function () { if (!+jml.value) { UI.toast("Isi jumlah", "err"); return; } S.push("sig_income", { id: uid(), iso: tgl.value, sumber: sumber.value.trim() || "-", jumlah: +jml.value, tipe: tipe }); m.close(); render(); UI.toast("Tercatat", "ok"); });
    }
    render();
  }
});
