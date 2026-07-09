/* klien.js — SIGNATURE Helm: pipeline klien/deal (Prospek → Nego → Deal →
   Selesai) + nilai potensi. Data: sig_clients [{id,nama,nilai,status,kontak}]. */
(window.SIG_SEEDERS = window.SIG_SEEDERS || []).push(function (S, spec, u) {
  if (spec.kind !== "business") return;
  var c = [
    { nama: "PT Maju Jaya", nilai: 15000000, status: "prospek", kontak: "Pak Andi" },
    { nama: "Toko Berkah", nilai: 5000000, status: "nego", kontak: "Bu Sinta" },
    { nama: "Startup Nusa", nilai: 25000000, status: "deal", kontak: "Rian" },
    { nama: "Cafe Senja", nilai: 8000000, status: "selesai", kontak: "Dewi" }
  ];
  S.set("sig_clients", c.map(function (x, i) { return Object.assign({ id: u.id() + i }, x); }));
});
window.Shell.register({
  id: "klien", nama: "Pipeline Klien", icon: "users-group",
  mount: function (root, ctx) {
    var UI = ctx.ui, S = ctx.store;
    var COLS = [["prospek", "🎯 Prospek", "#94a3b8"], ["nego", "💬 Negosiasi", "#fbbf24"], ["deal", "🤝 Deal", "#38bdf8"], ["selesai", "✅ Selesai", "#34d399"]];
    function all() { return S.get("sig_clients", []); }

    function render() {
      UI.clear(root);
      var arr = all();
      root.appendChild(UI.viewHead("Pipeline Klien", "Bisnis", UI.el("button", { class: "btn btn-primary", onclick: function () { edit(null); } }, [UI.icon("plus"), "Klien"])));
      if (!arr.length) { root.appendChild(UI.empty("Pipeline kosong.<br>Catat calon klien & lacak dari prospek sampai closing.", UI.el("button", { class: "btn btn-primary", onclick: function () { edit(null); } }, [UI.icon("plus"), "Tambah klien"]))); return; }
      var potensi = arr.filter(function (x) { return x.status !== "selesai"; }).reduce(function (a, x) { return a + (+x.nilai || 0); }, 0);
      var closed = arr.filter(function (x) { return x.status === "selesai"; }).reduce(function (a, x) { return a + (+x.nilai || 0); }, 0);
      root.appendChild(UI.el("div", { class: "cards", style: "margin-bottom:18px" }, [
        UI.statCard({ label: "Klien aktif", value: arr.filter(function (x) { return x.status !== "selesai"; }).length, icon: "users" }),
        UI.statCard({ label: "Nilai potensi", value: potensi, fmt: UI.money, icon: "target", color: "var(--warn)" }),
        UI.statCard({ label: "Deal tercapai", value: closed, fmt: UI.money, icon: "trophy", color: "var(--ok)" })
      ]));
      var board = UI.el("div", { class: "kanban" });
      COLS.forEach(function (c) {
        var col = UI.el("div", { class: "kb-col" });
        var items = arr.filter(function (x) { return x.status === c[0]; });
        col.appendChild(UI.el("div", { class: "kb-head" }, [UI.el("span", { class: "kb-dot", style: "background:" + c[2] }), UI.el("b", { text: c[1] }), UI.el("span", { class: "hint", style: "margin:0 0 0 auto", text: items.length + "" })]));
        items.forEach(function (x) {
          var idx = COLS.map(function (cc) { return cc[0]; }).indexOf(x.status);
          var card = UI.el("div", { class: "kb-card", onclick: function (e) { if (e.target.closest(".kb-move")) return; edit(x); } });
          card.appendChild(UI.el("div", { class: "kb-title", text: x.nama }));
          card.appendChild(UI.el("div", { class: "kb-meta" }, [UI.tag(UI.money(x.nilai), c[2]), x.kontak ? UI.el("span", { class: "hint", style: "margin:0", text: "👤 " + x.kontak }) : null]));
          card.appendChild(UI.el("div", { class: "kb-move" }, [
            idx > 0 ? UI.el("button", { class: "btn btn-ghost btn-icon", onclick: function () { x.status = COLS[idx - 1][0]; S.update("sig_clients", x.id, x); render(); } }, [UI.icon("chevron-left")]) : UI.el("span"),
            idx < 3 ? UI.el("button", { class: "btn btn-ghost btn-icon", onclick: function () { x.status = COLS[idx + 1][0]; S.update("sig_clients", x.id, x); render(); } }, [UI.icon("chevron-right")]) : UI.el("span")
          ]));
          col.appendChild(card);
        });
        col.appendChild(UI.el("button", { class: "kb-add", onclick: function () { edit({ status: c[0] }); } }, [UI.icon("plus"), "Tambah"]));
        board.appendChild(col);
      });
      root.appendChild(board);
    }
    function edit(x) {
      var isNew = !x || !x.id; var s0 = x && x.status ? x.status : "prospek"; x = (x && x.id) ? x : { id: uid(), nama: "", nilai: 0, status: s0, kontak: "" };
      var nama = UI.input({ val: x.nama, ph: "Nama klien / perusahaan" });
      var nilai = UI.input({ type: "number", val: x.nilai || "", ph: "0" });
      var status = UI.select(COLS.map(function (c) { return { v: c[0], l: c[1] }; }), x.status);
      var kontak = UI.input({ val: x.kontak, ph: "Nama kontak (opsional)" });
      var body = UI.el("div", {}, [UI.field("Nama klien", nama), UI.el("div", { class: "grid2" }, [UI.field("Nilai deal (Rp)", nilai), UI.field("Status", status)]), UI.field("Kontak", kontak)]);
      var save = UI.el("button", { class: "btn btn-primary", text: isNew ? "Tambah" : "Simpan" });
      var del = isNew ? null : UI.el("button", { class: "btn btn-danger", text: "Hapus" });
      body.appendChild(UI.el("div", { class: "row", style: "justify-content:space-between;margin-top:6px" }, [del || UI.el("span"), save]));
      var m = UI.modal(isNew ? "Klien Baru" : "Edit Klien", body);
      save.addEventListener("click", function () { if (!nama.value.trim()) { UI.toast("Isi nama", "err"); return; } x.nama = nama.value.trim(); x.nilai = +nilai.value || 0; x.status = status.value; x.kontak = kontak.value.trim(); if (isNew) S.push("sig_clients", x); else S.update("sig_clients", x.id, x); m.close(); render(); });
      if (del) del.addEventListener("click", function () { m.close(); UI.confirm("Hapus klien?", "", function () { S.remove("sig_clients", x.id); render(); }, { danger: true }); });
    }
    render();
  }
});
