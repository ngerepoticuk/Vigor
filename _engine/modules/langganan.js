/* langganan.js — SIGNATURE Saldo: tagihan & langganan rutin (siklus, jatuh
   tempo, total/bulan) + tandai bayar → maju siklus. Data: sig_subs. */
(window.SIG_SEEDERS = window.SIG_SEEDERS || []).push(function (S, spec, u) {
  if (spec.kind !== "finance") return;
  var s = [
    { nama: "Listrik & air", jumlah: 450000, siklus: "bulanan", due: 3 },
    { nama: "Internet rumah", jumlah: 350000, siklus: "bulanan", due: 8 },
    { nama: "Streaming", jumlah: 55000, siklus: "bulanan", due: 14 },
    { nama: "Asuransi kesehatan", jumlah: 400000, siklus: "bulanan", due: 24 }
  ];
  S.set("sig_subs", s.map(function (x, i) {
    var d = new Date(); d.setDate(x.due); if (d < new Date()) d.setMonth(d.getMonth() + 1);
    return { id: u.id() + i, nama: x.nama, jumlah: x.jumlah, siklus: x.siklus, nextDue: d.toISOString().slice(0, 10) };
  }));
});
window.Shell.register({
  id: "langganan", nama: "Tagihan Rutin", icon: "receipt-2",
  mount: function (root, ctx) {
    var UI = ctx.ui, S = ctx.store;
    function all() { return S.get("sig_subs", []); }
    function daysTo(iso) { return Math.round((new Date(iso) - new Date().setHours(0, 0, 0, 0)) / 864e5); }
    function perBulan(x) { return x.siklus === "tahunan" ? Math.round(x.jumlah / 12) : x.jumlah; }

    function render() {
      UI.clear(root);
      var arr = all().slice().sort(function (a, b) { return a.nextDue < b.nextDue ? -1 : 1; });
      root.appendChild(UI.viewHead("Tagihan & Langganan", "Uang", UI.el("button", { class: "btn btn-primary", onclick: function () { edit(null); } }, [UI.icon("plus"), "Tagihan"])));
      if (!arr.length) { root.appendChild(UI.empty("Belum ada tagihan rutin.<br>Catat listrik, internet, langganan streaming — biar tak ada yang telat & kelihatan total 'bocor tetap' bulananmu.", UI.el("button", { class: "btn btn-primary", onclick: function () { edit(null); } }, [UI.icon("plus"), "Tambah tagihan"]))); return; }
      var totBulan = arr.reduce(function (a, x) { return a + perBulan(x); }, 0);
      var soon = arr.filter(function (x) { return daysTo(x.nextDue) <= 7; });
      root.appendChild(UI.el("div", { class: "cards", style: "margin-bottom:18px" }, [
        UI.statCard({ label: "Total / bulan", value: totBulan, fmt: UI.money, icon: "receipt-2", color: "var(--warn)" }),
        UI.statCard({ label: "Jatuh tempo ≤7 hari", value: soon.length, icon: "alarm", color: soon.length ? "var(--danger)" : "var(--ok)" }),
        UI.statCard({ label: "Tagihan aktif", value: arr.length, icon: "list" })
      ]));
      arr.forEach(function (x) {
        var d = daysTo(x.nextDue), urgent = d <= 3;
        root.appendChild(UI.el("div", { class: "hrow" }, [
          UI.el("div", { class: "tpl-ic", style: "width:38px;height:38px;background:" + (urgent ? "var(--danger)" : "var(--primary)") }, [UI.icon("receipt-2")]),
          UI.el("div", { style: "flex:1;min-width:0" }, [
            UI.el("div", { class: "hname", text: x.nama }),
            UI.el("div", { class: "hmeta" }, [UI.el("span", { text: UI.money(x.jumlah) + " / " + x.siklus }),
              UI.el("span", { style: urgent ? "color:var(--danger);font-weight:700" : "", text: "⌛ " + UI.fmtDate(x.nextDue, true) + (d === 0 ? " (hari ini!)" : d > 0 ? " (" + d + " hari)" : " (LEWAT)") })])
          ]),
          UI.el("button", { class: "btn btn-primary btn-sm", onclick: function () { bayar(x); } }, [UI.icon("cash"), "Bayar"]),
          UI.el("button", { class: "btn btn-ghost btn-icon", onclick: function () { edit(x); } }, [UI.icon("dots")])
        ]));
      });
    }
    function bayar(x) {
      var d = new Date(x.nextDue);
      if (x.siklus === "tahunan") d.setFullYear(d.getFullYear() + 1); else d.setMonth(d.getMonth() + 1);
      x.nextDue = d.toISOString().slice(0, 10);
      S.update("sig_subs", x.id, x);
      // catat juga ke amplop bila ada kategori Tagihan
      var bd = S.get("sig_budget", null);
      if (bd && bd.cats) { var cat = bd.cats.filter(function (c) { return /tagihan/i.test(c.nama); })[0]; if (cat) { bd.tx.push({ id: uid(), catId: cat.id, jumlah: x.jumlah, teks: "Bayar " + x.nama, iso: UI.todayISO() }); S.set("sig_budget", bd); } }
      UI.toast("Tercatat — jatuh tempo berikutnya " + UI.fmtDate(x.nextDue, true) + " ✓", "ok");
      render();
    }
    function edit(x) {
      var isNew = !x; x = x || { id: uid(), nama: "", jumlah: 0, siklus: "bulanan", nextDue: UI.todayISO() };
      var nama = UI.input({ val: x.nama, ph: "mis. Internet rumah" });
      var jml = UI.input({ type: "number", val: x.jumlah || "", ph: "0" });
      var sik = UI.select([{ v: "bulanan", l: "Bulanan" }, { v: "tahunan", l: "Tahunan" }], x.siklus);
      var due = UI.input({ type: "date", val: x.nextDue });
      var body = UI.el("div", {}, [UI.field("Nama tagihan", nama), UI.el("div", { class: "grid2" }, [UI.field("Jumlah (Rp)", jml), UI.field("Siklus", sik)]), UI.field("Jatuh tempo berikutnya", due)]);
      var save = UI.el("button", { class: "btn btn-primary", text: isNew ? "Tambah" : "Simpan" });
      var del = isNew ? null : UI.el("button", { class: "btn btn-danger", text: "Hapus" });
      body.appendChild(UI.el("div", { class: "row", style: "justify-content:space-between;margin-top:6px" }, [del || UI.el("span"), save]));
      var m = UI.modal(isNew ? "Tagihan Baru" : "Edit Tagihan", body);
      save.addEventListener("click", function () { if (!nama.value.trim()) { UI.toast("Isi nama", "err"); return; } x.nama = nama.value.trim(); x.jumlah = +jml.value || 0; x.siklus = sik.value; x.nextDue = due.value; if (isNew) S.push("sig_subs", x); else S.update("sig_subs", x.id, x); m.close(); render(); });
      if (del) del.addEventListener("click", function () { m.close(); UI.confirm("Hapus tagihan?", "", function () { S.remove("sig_subs", x.id); render(); }, { danger: true }); });
    }
    render();
  }
});
