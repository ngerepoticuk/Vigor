/* impian.js — SIGNATURE Saldo (juga dipakai wedding=tabungan): tabungan tujuan
   dengan target, terkumpul, tenggat, & rekomendasi nabung/bulan. Data: sig_savings. */
(window.SIG_SEEDERS = window.SIG_SEEDERS || []).push(function (S, spec, u) {
  if (spec.kind !== "finance") return;
  var g = [
    { nama: "Dana Darurat", target: 30000000, terkumpul: 12000000, warna: "#12b981", deadline: "" },
    { nama: "Umroh", target: 45000000, terkumpul: 8000000, warna: "#a78bfa", deadline: u.iso(u.shift(400)) },
    { nama: "DP Rumah", target: 100000000, terkumpul: 15000000, warna: "#fbbf24", deadline: u.iso(u.shift(700)) }
  ];
  S.set("sig_savings", g.map(function (x, i) { return Object.assign({ id: u.id() + i }, x); }));
});
window.Shell.register({
  id: "impian", nama: "Tabungan Impian", icon: "pig-money",
  mount: function (root, ctx) {
    var UI = ctx.ui, S = ctx.store;
    function goals() { return S.get("sig_savings", []); }

    function render() {
      UI.clear(root);
      var g = goals();
      root.appendChild(UI.viewHead("Tabungan Impian", "Uang", UI.el("button", { class: "btn btn-primary", onclick: function () { edit(null); } }, [UI.icon("plus"), "Impian"])));
      if (!g.length) { root.appendChild(UI.empty("Punya impian? Beri dia rekening.<br>Tetapkan target (rumah, umroh, dana darurat) & pantau tabunganmu tumbuh.", UI.el("button", { class: "btn btn-primary", onclick: function () { edit(null); } }, [UI.icon("plus"), "Buat impian"]))); return; }
      var totTarget = g.reduce(function (a, x) { return a + x.target; }, 0), totKumpul = g.reduce(function (a, x) { return a + x.terkumpul; }, 0);
      root.appendChild(UI.el("div", { class: "cards", style: "margin-bottom:18px" }, [
        UI.statCard({ label: "Total terkumpul", value: totKumpul, fmt: UI.money, icon: "pig-money", color: "var(--ok)" }),
        UI.statCard({ label: "Total target", value: totTarget, fmt: UI.money, icon: "target" }),
        UI.statCard({ label: "Progres", value: totTarget ? Math.round(totKumpul / totTarget * 100) : 0, fmt: function (v) { return Math.round(v) + "%"; }, icon: "chart-arcs" }),
        UI.statCard({ label: "Impian aktif", value: g.length, icon: "sparkles" })
      ]));
      var grid = UI.el("div", { class: "grid2" });
      g.forEach(function (x) {
        var pct = x.target ? Math.min(100, Math.round(x.terkumpul / x.target * 100)) : 0;
        var perBulan = null;
        if (x.deadline) { var bln = Math.max(1, Math.ceil((new Date(x.deadline) - Date.now()) / 864e5 / 30)); perBulan = Math.ceil((x.target - x.terkumpul) / bln); }
        var card = UI.el("div", { class: "panel" }, [
          UI.el("div", { class: "flex between center", style: "margin-bottom:8px" }, [
            UI.el("div", { class: "flex center gap8" }, [UI.el("span", { class: "pk-dot", style: "background:" + (x.warna || "var(--primary)") }), UI.el("div", { class: "panel-t", style: "margin:0", text: x.nama })]),
            UI.el("button", { class: "btn btn-ghost btn-icon", onclick: function () { edit(x); } }, [UI.icon("dots")])
          ]),
          UI.el("div", { class: "flex between", style: "font-size:13px;margin-bottom:8px" }, [UI.el("b", { text: UI.money(x.terkumpul) }), UI.el("span", { class: "muted", text: "dari " + UI.money(x.target) })]),
          UI.progress(pct, { color: x.warna || "var(--primary)" }),
          UI.el("div", { class: "flex between center", style: "margin-top:10px" }, [
            UI.el("span", { style: "font-weight:700;color:" + (x.warna || "var(--primary)"), text: pct + "%" }),
            perBulan != null ? UI.el("span", { class: "hint", style: "margin:0", text: "Nabung ~" + UI.money(perBulan) + "/bln" }) : UI.el("span")
          ]),
          UI.el("button", { class: "btn btn-ghost btn-sm", style: "margin-top:12px;width:100%", onclick: function () { nabung(x); } }, [UI.icon("plus"), "Nabung"])
        ]);
        if (pct >= 100) card.appendChild(UI.el("div", { class: "rt-done", style: "margin-top:10px", text: "🎉 Tercapai!" }));
        grid.appendChild(card);
      });
      root.appendChild(grid);
    }
    function nabung(x) {
      var jml = UI.input({ type: "number", ph: "0" });
      var body = UI.el("div", {}, [UI.el("p", { class: "hint", text: x.nama + ": " + UI.money(x.terkumpul) + " / " + UI.money(x.target) }), UI.field("Nabung berapa? (Rp)", jml)]);
      var save = UI.el("button", { class: "btn btn-primary", text: "Simpan" }); body.appendChild(UI.el("div", { class: "row", style: "justify-content:flex-end;margin-top:6px" }, [save]));
      var m = UI.modal("Tambah Tabungan", body);
      save.addEventListener("click", function () { x.terkumpul += (+jml.value || 0); S.update("sig_savings", x.id, x); m.close(); if (x.terkumpul >= x.target && window.Onboard) Onboard.confetti(); render(); UI.toast("Mantap, terus konsisten! 💪", "ok"); });
    }
    function edit(x) {
      var isNew = !x; x = x || { id: uid(), nama: "", target: 0, terkumpul: 0, warna: "#12b981", deadline: "" };
      var nama = UI.input({ val: x.nama, ph: "mis. Dana Darurat" });
      var target = UI.input({ type: "number", val: x.target || "", ph: "0" });
      var kumpul = UI.input({ type: "number", val: x.terkumpul || "", ph: "0" });
      var dl = UI.input({ type: "date", val: x.deadline });
      var body = UI.el("div", {}, [UI.field("Nama impian", nama), UI.el("div", { class: "grid2" }, [UI.field("Target (Rp)", target), UI.field("Sudah terkumpul (Rp)", kumpul)]), UI.field("Target tercapai (opsional)", dl)]);
      var save = UI.el("button", { class: "btn btn-primary", text: isNew ? "Tambah" : "Simpan" });
      var del = isNew ? null : UI.el("button", { class: "btn btn-danger", text: "Hapus" });
      body.appendChild(UI.el("div", { class: "row", style: "justify-content:space-between;margin-top:6px" }, [del || UI.el("span"), save]));
      var m = UI.modal(isNew ? "Impian Baru" : "Edit Impian", body);
      save.addEventListener("click", function () { if (!nama.value.trim()) { UI.toast("Isi nama", "err"); return; } x.nama = nama.value.trim(); x.target = +target.value || 0; x.terkumpul = +kumpul.value || 0; x.deadline = dl.value; if (isNew) S.push("sig_savings", x); else S.update("sig_savings", x.id, x); m.close(); render(); });
      if (del) del.addEventListener("click", function () { m.close(); UI.confirm("Hapus impian?", "", function () { S.remove("sig_savings", x.id); render(); }, { danger: true }); });
    }
    render();
  }
});
