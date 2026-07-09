/* utang.js — SIGNATURE Saldo: pelunasan utang metode Snowball (lunasi terkecil
   dulu untuk momentum). Data: sig_debts [{id,nama,sisa,cicilan,bunga}]. */
(window.SIG_SEEDERS = window.SIG_SEEDERS || []).push(function (S, spec, u) {
  if (spec.kind !== "finance") return;
  var d = [
    { nama: "Paylater HP", sisa: 2400000, cicilan: 400000, bunga: 2.5 },
    { nama: "Cicilan motor", sisa: 8500000, cicilan: 950000, bunga: 1.5 },
    { nama: "Kartu kredit", sisa: 5200000, cicilan: 600000, bunga: 2.9 }
  ];
  S.set("sig_debts", d.map(function (x, i) { return Object.assign({ id: u.id() + i }, x); }));
});
window.Shell.register({
  id: "utang", nama: "Lunas Utang", icon: "credit-card",
  mount: function (root, ctx) {
    var UI = ctx.ui, S = ctx.store;
    function debts() { return S.get("sig_debts", []); }

    function render() {
      UI.clear(root);
      var d = debts().slice().sort(function (a, b) { return a.sisa - b.sisa; }); // snowball: terkecil dulu
      root.appendChild(UI.viewHead("Lunas Utang", "Uang", UI.el("button", { class: "btn btn-primary", onclick: function () { edit(null); } }, [UI.icon("plus"), "Utang"])));
      if (!d.length) { root.appendChild(UI.empty("Bebas utang? Mantap! 🎉<br>Atau catat utang di sini dan lunasi dengan metode Snowball — bola salju momentum.", UI.el("button", { class: "btn btn-primary", onclick: function () { edit(null); } }, [UI.icon("plus"), "Catat utang"]))); return; }
      var total = d.reduce(function (a, x) { return a + x.sisa; }, 0), cicil = d.reduce(function (a, x) { return a + x.cicilan; }, 0);
      root.appendChild(UI.el("div", { class: "cards", style: "margin-bottom:18px" }, [
        UI.statCard({ label: "Total utang", value: total, fmt: UI.money, icon: "credit-card", color: "var(--danger)" }),
        UI.statCard({ label: "Cicilan / bulan", value: cicil, fmt: UI.money, icon: "calendar" }),
        UI.statCard({ label: "Jumlah utang", value: d.length, icon: "list" }),
        UI.statCard({ label: "Estimasi lunas", value: cicil ? Math.ceil(total / cicil) : 0, fmt: function (v) { return Math.round(v) + " bln"; }, icon: "flag" })
      ]));
      root.appendChild(UI.briefing("Metode <b>Snowball</b>: fokus lunasi utang <span class='hl'>terkecil</span> dulu (sambil bayar minimum yang lain). Tiap satu lunas, momentum & semangat naik. Urutan disusun otomatis di bawah.", { title: "Strategi", icon: "bulb" }));
      var list = UI.el("div", { style: "margin-top:16px" });
      d.forEach(function (x, i) {
        var isFocus = i === 0;
        var card = UI.el("div", { class: "panel", style: "margin-bottom:12px" + (isFocus ? ";border-color:color-mix(in srgb,var(--primary) 40%,var(--line))" : "") }, [
          UI.el("div", { class: "flex between center" }, [
            UI.el("div", { class: "flex center gap8" }, [UI.el("span", { class: "tl-badge", text: (i + 1) }), UI.el("div", {}, [UI.el("div", { class: "panel-t", style: "margin:0", text: x.nama }), UI.el("div", { class: "hint", style: "margin:0", text: "Cicilan " + UI.money(x.cicilan) + "/bln · bunga " + x.bunga + "%" })])]),
            UI.el("div", { style: "text-align:right" }, [UI.el("div", { style: "font-family:var(--font-d);font-weight:800;font-size:18px;color:var(--danger)", text: UI.money(x.sisa) }), isFocus ? UI.tag("Fokus lunasi ini", "var(--primary)") : null])
          ]),
          UI.el("div", { class: "row gap8", style: "margin-top:12px" }, [
            UI.el("button", { class: "btn btn-ghost btn-sm", onclick: function () { bayar(x); } }, [UI.icon("cash"), "Catat bayar"]),
            UI.el("button", { class: "btn btn-ghost btn-sm", onclick: function () { edit(x); } }, [UI.icon("edit"), "Edit"])
          ])
        ]);
        list.appendChild(card);
      });
      root.appendChild(list);
    }
    function bayar(x) {
      var jml = UI.input({ type: "number", val: x.cicilan, ph: "0" });
      var body = UI.el("div", {}, [UI.el("p", { class: "hint", text: "Sisa " + x.nama + ": " + UI.money(x.sisa) }), UI.field("Jumlah bayar (Rp)", jml)]);
      var save = UI.el("button", { class: "btn btn-primary", text: "Bayar" }); body.appendChild(UI.el("div", { class: "row", style: "justify-content:flex-end;margin-top:6px" }, [save]));
      var m = UI.modal("Catat Pembayaran", body);
      save.addEventListener("click", function () { var b = +jml.value || 0; x.sisa = Math.max(0, x.sisa - b); if (x.sisa === 0) { S.remove("sig_debts", x.id); if (window.Onboard) Onboard.confetti(); UI.toast("🎉 Lunas! Satu beban hilang.", "ok"); } else { S.update("sig_debts", x.id, x); UI.toast("Tercatat, sisa " + UI.money(x.sisa), "ok"); } m.close(); render(); });
    }
    function edit(x) {
      var isNew = !x; x = x || { id: uid(), nama: "", sisa: 0, cicilan: 0, bunga: 0 };
      var nama = UI.input({ val: x.nama, ph: "mis. Cicilan motor" });
      var sisa = UI.input({ type: "number", val: x.sisa || "", ph: "0" });
      var cicilan = UI.input({ type: "number", val: x.cicilan || "", ph: "0" });
      var bunga = UI.input({ type: "number", step: "0.1", val: x.bunga || "", ph: "0" });
      var body = UI.el("div", {}, [UI.field("Nama utang", nama), UI.field("Sisa utang (Rp)", sisa), UI.el("div", { class: "grid2" }, [UI.field("Cicilan/bln (Rp)", cicilan), UI.field("Bunga (%)", bunga)])]);
      var save = UI.el("button", { class: "btn btn-primary", text: isNew ? "Tambah" : "Simpan" });
      var del = isNew ? null : UI.el("button", { class: "btn btn-danger", text: "Hapus" });
      body.appendChild(UI.el("div", { class: "row", style: "justify-content:space-between;margin-top:6px" }, [del || UI.el("span"), save]));
      var m = UI.modal(isNew ? "Utang Baru" : "Edit Utang", body);
      save.addEventListener("click", function () { if (!nama.value.trim()) { UI.toast("Isi nama", "err"); return; } x.nama = nama.value.trim(); x.sisa = +sisa.value || 0; x.cicilan = +cicilan.value || 0; x.bunga = +bunga.value || 0; if (isNew) S.push("sig_debts", x); else S.update("sig_debts", x.id, x); m.close(); render(); });
      if (del) del.addEventListener("click", function () { m.close(); UI.confirm("Hapus utang?", "", function () { S.remove("sig_debts", x.id); render(); }, { danger: true }); });
    }
    render();
  }
});
