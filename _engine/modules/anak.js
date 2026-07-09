/* anak.js — SIGNATURE Nara: profil anak + milestone tumbuh kembang + momen.
   Data: sig_kids { children:[{id,nama,lahir}], moments:[{id,childId,teks,iso,tipe}] }. */
(window.SIG_SEEDERS = window.SIG_SEEDERS || []).push(function (S, spec, u) {
  if (spec.kind !== "mom") return;
  var c1 = u.id() + "k1";
  var lahir = new Date(); lahir.setFullYear(lahir.getFullYear() - 2); lahir.setMonth(lahir.getMonth() - 3);
  S.set("sig_kids", {
    children: [{ id: c1, nama: "Si Kecil", lahir: lahir.toISOString().slice(0, 10) }],
    moments: [
      { id: u.id() + "m1", childId: c1, teks: "Langkah pertama! 👣", iso: u.iso(u.shift(-60)), tipe: "milestone" },
      { id: u.id() + "m2", childId: c1, teks: "Bisa bilang 'mama'", iso: u.iso(u.shift(-30)), tipe: "milestone" },
      { id: u.id() + "m3", childId: c1, teks: "Imunisasi lengkap 18 bulan", iso: u.iso(u.shift(-14)), tipe: "kesehatan" }
    ]
  });
});
window.Shell.register({
  id: "anak", nama: "Tumbuh Kembang", icon: "baby-carriage",
  mount: function (root, ctx) {
    var UI = ctx.ui, S = ctx.store;
    var TIPE = { milestone: { l: "Milestone", c: "var(--primary)" }, kesehatan: { l: "Kesehatan", c: "var(--ok)" }, momen: { l: "Momen", c: "var(--accent)" } };
    function data() { return S.get("sig_kids", { children: [], moments: [] }); }
    function save(d) { S.set("sig_kids", d); }
    function usia(lahir) { var ms = Date.now() - new Date(lahir); var bln = Math.floor(ms / 864e5 / 30.44); var th = Math.floor(bln / 12); return th > 0 ? th + " thn " + (bln % 12) + " bln" : bln + " bulan"; }

    function render() {
      UI.clear(root);
      var d = data();
      root.appendChild(UI.viewHead("Tumbuh Kembang", "Keluarga", UI.el("div", { class: "row gap8" }, [
        UI.el("button", { class: "btn btn-ghost", onclick: function () { editChild(null); } }, [UI.icon("plus"), "Anak"]),
        d.children.length ? UI.el("button", { class: "btn btn-primary", onclick: function () { addMoment(); } }, [UI.icon("star"), "Momen"]) : null
      ])));
      if (!d.children.length) { root.appendChild(UI.empty("Belum ada data anak.<br>Tambah profil anak, lalu rekam milestone & momen berharganya.", UI.el("button", { class: "btn btn-primary", onclick: function () { editChild(null); } }, [UI.icon("plus"), "Tambah anak"]))); return; }
      d.children.forEach(function (c) {
        root.appendChild(UI.el("div", { class: "panel", style: "margin-bottom:14px" }, [
          UI.el("div", { class: "flex center gap12" }, [
            UI.el("div", { class: "avatar", style: "width:48px;height:48px;font-size:18px" }, [UI.el("span", { text: (c.nama[0] || "?").toUpperCase() })]),
            UI.el("div", { style: "flex:1" }, [UI.el("div", { class: "panel-t", style: "margin:0", text: c.nama }), UI.el("div", { class: "hint", style: "margin:0", text: "Usia " + usia(c.lahir) + " · lahir " + UI.fmtDate(c.lahir, true) })]),
            UI.el("button", { class: "btn btn-ghost btn-icon", onclick: function () { editChild(c); } }, [UI.icon("dots")])
          ])
        ]));
        var moments = d.moments.filter(function (m) { return m.childId === c.id; }).sort(function (a, b) { return a.iso < b.iso ? 1 : -1; });
        if (moments.length) {
          var tl = UI.el("div", { class: "moment-tl" });
          moments.forEach(function (m) {
            tl.appendChild(UI.el("div", { class: "moment" }, [
              UI.el("div", { class: "moment-dot", style: "background:" + (TIPE[m.tipe] || TIPE.momen).c }),
              UI.el("div", { style: "flex:1" }, [UI.el("div", { class: "flex center gap8" }, [UI.el("b", { text: m.teks }), UI.tag((TIPE[m.tipe] || TIPE.momen).l, (TIPE[m.tipe] || TIPE.momen).c)]), UI.el("div", { class: "hint", style: "margin:0", text: UI.fmtDate(m.iso, true) })]),
              UI.el("span", { class: "hint", style: "margin:0;cursor:pointer", text: "✕", onclick: function () { d.moments = d.moments.filter(function (x) { return x.id !== m.id; }); save(d); render(); } })
            ]));
          });
          root.appendChild(tl);
        } else root.appendChild(UI.el("div", { class: "hint", style: "margin-bottom:14px", text: "Belum ada momen untuk " + c.nama + ". Klik 'Momen' untuk merekam." }));
      });
    }
    function editChild(c) {
      var d = data(), isNew = !c; c = c || { id: uid(), nama: "", lahir: "" };
      var nama = UI.input({ val: c.nama, ph: "Nama anak" });
      var lahir = UI.input({ type: "date", val: c.lahir });
      var body = UI.el("div", {}, [UI.field("Nama", nama), UI.field("Tanggal lahir", lahir)]);
      var save2 = UI.el("button", { class: "btn btn-primary", text: isNew ? "Tambah" : "Simpan" });
      var del = isNew ? null : UI.el("button", { class: "btn btn-danger", text: "Hapus" });
      body.appendChild(UI.el("div", { class: "row", style: "justify-content:space-between;margin-top:6px" }, [del || UI.el("span"), save2]));
      var m = UI.modal(isNew ? "Anak Baru" : "Edit Anak", body);
      save2.addEventListener("click", function () { if (!nama.value.trim()) { UI.toast("Isi nama", "err"); return; } c.nama = nama.value.trim(); c.lahir = lahir.value; var i = d.children.map(function (x) { return x.id; }).indexOf(c.id); if (i >= 0) d.children[i] = c; else d.children.push(c); save(d); m.close(); render(); });
      if (del) del.addEventListener("click", function () { m.close(); UI.confirm("Hapus anak?", "Momen terkait ikut terhapus.", function () { d.children = d.children.filter(function (x) { return x.id !== c.id; }); d.moments = d.moments.filter(function (x) { return x.childId !== c.id; }); save(d); render(); }, { danger: true }); });
    }
    function addMoment() {
      var d = data();
      var child = UI.select(d.children.map(function (c) { return { v: c.id, l: c.nama }; }), d.children[0].id);
      var teks = UI.input({ ph: "mis. Gigi pertama tumbuh" });
      var tipe = UI.select([{ v: "milestone", l: "Milestone" }, { v: "kesehatan", l: "Kesehatan" }, { v: "momen", l: "Momen" }], "milestone");
      var tgl = UI.input({ type: "date", val: UI.todayISO() });
      var body = UI.el("div", {}, [UI.field("Anak", child), UI.field("Apa yang terjadi?", teks), UI.el("div", { class: "grid2" }, [UI.field("Jenis", tipe), UI.field("Tanggal", tgl)])]);
      var save2 = UI.el("button", { class: "btn btn-primary", text: "Simpan" }); body.appendChild(UI.el("div", { class: "row", style: "justify-content:flex-end;margin-top:6px" }, [save2]));
      var m = UI.modal("Rekam Momen", body);
      save2.addEventListener("click", function () { if (!teks.value.trim()) { UI.toast("Isi momen", "err"); return; } d.moments.push({ id: uid(), childId: child.value, teks: teks.value.trim(), tipe: tipe.value, iso: tgl.value }); save(d); m.close(); render(); UI.toast("Momen tersimpan 💕", "ok"); });
    }
    render();
  }
});
