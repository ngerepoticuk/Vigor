/* seserahan.js — SIGNATURE Ikrar: daftar seserahan/hantaran + status + biaya.
   Data: sig_seserahan [{id,nama,status,biaya}]. status: rencana|dibeli|dikemas */
(window.SIG_SEEDERS = window.SIG_SEEDERS || []).push(function (S, spec, u) {
  if (spec.kind !== "wedding") return;
  var it = [
    { nama: "Seperangkat alat salat", status: "dikemas", biaya: 850000 },
    { nama: "Perhiasan emas", status: "dibeli", biaya: 5000000 },
    { nama: "Tas & sepatu", status: "dibeli", biaya: 2500000 },
    { nama: "Perawatan tubuh & makeup", status: "rencana", biaya: 1200000 },
    { nama: "Kain & busana", status: "rencana", biaya: 1500000 },
    { nama: "Buah & kue tradisional", status: "rencana", biaya: 600000 }
  ];
  S.set("sig_seserahan", it.map(function (x, i) { return Object.assign({ id: u.id() + i }, x); }));
});
window.Shell.register({
  id: "seserahan", nama: "Seserahan", icon: "gift",
  mount: function (root, ctx) {
    var UI = ctx.ui, S = ctx.store;
    var ST = { rencana: { l: "Rencana", c: "var(--muted)" }, dibeli: { l: "Dibeli", c: "var(--warn)" }, dikemas: { l: "Dikemas ✓", c: "var(--ok)" } };
    var ORDER = ["rencana", "dibeli", "dikemas"];
    function items() { return S.get("sig_seserahan", []); }

    function render() {
      UI.clear(root);
      var arr = items();
      root.appendChild(UI.viewHead("Seserahan & Hantaran", "Pernikahan", UI.el("button", { class: "btn btn-primary", onclick: function () { edit(null); } }, [UI.icon("plus"), "Item"])));
      if (!arr.length) { root.appendChild(UI.empty("Belum ada daftar seserahan.<br>Catat item, biaya, dan statusnya — dari rencana sampai terbungkus rapi.", UI.el("button", { class: "btn btn-primary", onclick: function () { edit(null); } }, [UI.icon("plus"), "Tambah item"]))); return; }
      var tot = arr.reduce(function (a, x) { return a + (+x.biaya || 0); }, 0);
      var kemasN = arr.filter(function (x) { return x.status === "dikemas"; }).length;
      root.appendChild(UI.el("div", { class: "cards", style: "margin-bottom:18px" }, [
        UI.statCard({ label: "Total item", value: arr.length, icon: "gift" }),
        UI.statCard({ label: "Siap dikemas", value: kemasN + "/" + arr.length, icon: "package" }),
        UI.statCard({ label: "Total biaya", value: tot, fmt: UI.money, icon: "wallet" })
      ]));
      arr.forEach(function (x) {
        var idx = ORDER.indexOf(x.status);
        root.appendChild(UI.el("div", { class: "hrow" }, [
          UI.el("div", { class: "tpl-ic", style: "width:38px;height:38px;background:" + ST[x.status].c }, [UI.icon("gift")]),
          UI.el("div", { style: "flex:1;min-width:0" }, [UI.el("div", { class: "hname", text: x.nama }), UI.el("div", { class: "hmeta" }, [UI.tag(ST[x.status].l, ST[x.status].c), UI.el("span", { text: UI.money(x.biaya) })])]),
          idx < 2 ? UI.el("button", { class: "btn btn-ghost btn-sm", onclick: function () { x.status = ORDER[idx + 1]; S.update("sig_seserahan", x.id, x); render(); UI.toast(x.status === "dikemas" ? "Terbungkus rapi ✓" : "Status naik ✓", "ok"); } }, [UI.icon("arrow-right"), ST[ORDER[idx + 1]].l]) : null,
          UI.el("button", { class: "btn btn-ghost btn-icon", onclick: function () { edit(x); } }, [UI.icon("dots")])
        ]));
      });
    }
    function edit(x) {
      var isNew = !x; x = x || { id: uid(), nama: "", status: "rencana", biaya: 0 };
      var nama = UI.input({ val: x.nama, ph: "mis. Seperangkat alat salat" });
      var biaya = UI.input({ type: "number", val: x.biaya || "", ph: "0" });
      var st = UI.select(ORDER.map(function (k) { return { v: k, l: ST[k].l }; }), x.status);
      var body = UI.el("div", {}, [UI.field("Item", nama), UI.el("div", { class: "grid2" }, [UI.field("Biaya (Rp)", biaya), UI.field("Status", st)])]);
      var save = UI.el("button", { class: "btn btn-primary", text: isNew ? "Tambah" : "Simpan" });
      var del = isNew ? null : UI.el("button", { class: "btn btn-danger", text: "Hapus" });
      body.appendChild(UI.el("div", { class: "row", style: "justify-content:space-between;margin-top:6px" }, [del || UI.el("span"), save]));
      var m = UI.modal(isNew ? "Item Seserahan" : "Edit Item", body);
      save.addEventListener("click", function () { if (!nama.value.trim()) { UI.toast("Isi nama", "err"); return; } x.nama = nama.value.trim(); x.biaya = +biaya.value || 0; x.status = st.value; if (isNew) S.push("sig_seserahan", x); else S.update("sig_seserahan", x.id, x); m.close(); render(); });
      if (del) del.addEventListener("click", function () { m.close(); UI.confirm("Hapus item?", "", function () { S.remove("sig_seserahan", x.id); render(); }, { danger: true }); });
    }
    render();
  }
});
