/* vendor.js — SIGNATURE Ikrar (Mahligai-style): manajemen vendor pernikahan
   (jenis, kontak, biaya, DP, status bayar) + rekap total & sisa. Data: sig_vendors. */
(window.SIG_SEEDERS = window.SIG_SEEDERS || []).push(function (S, spec, u) {
  if (spec.kind !== "wedding") return;
  var v = [
    { jenis: "Venue", nama: "Gedung Graha Bahagia", kontak: "0812-xxxx", biaya: 35000000, dp: 10000000, status: "dp" },
    { jenis: "Katering", nama: "Dapur Nusantara", kontak: "0813-xxxx", biaya: 42000000, dp: 15000000, status: "dp" },
    { jenis: "Dekorasi", nama: "Floral Story Decor", kontak: "0857-xxxx", biaya: 18000000, dp: 5000000, status: "dp" },
    { jenis: "Foto & Video", nama: "Momen Abadi Studio", kontak: "0821-xxxx", biaya: 12000000, dp: 12000000, status: "lunas" },
    { jenis: "MUA & Busana", nama: "Ayu Makeup Artist", kontak: "0838-xxxx", biaya: 9000000, dp: 0, status: "incar" }
  ];
  S.set("sig_vendors", v.map(function (x, i) { return Object.assign({ id: u.id() + i, catatan: "" }, x); }));
});
window.Shell.register({
  id: "vendor", nama: "Vendor", icon: "briefcase",
  mount: function (root, ctx) {
    var UI = ctx.ui, S = ctx.store;
    var ST = { incar: { l: "Diincar", c: "var(--muted)" }, dp: { l: "Sudah DP", c: "var(--warn)" }, lunas: { l: "Lunas", c: "var(--ok)" } };
    function vendors() { return S.get("sig_vendors", []); }

    function render() {
      UI.clear(root);
      var v = vendors();
      root.appendChild(UI.viewHead("Vendor Pernikahan", "Pernikahan", UI.el("div", { class: "row gap8" }, [
        UI.el("button", { class: "btn btn-ghost", onclick: tipsAI }, [UI.icon("sparkles"), "Tips Nego AI"]),
        UI.el("button", { class: "btn btn-primary", onclick: function () { edit(null); } }, [UI.icon("plus"), "Vendor"])
      ])));
      if (!v.length) { root.appendChild(UI.empty("Belum ada vendor.<br>Catat calon vendor, bandingkan biaya, dan lacak pembayaran DP → lunas.", UI.el("button", { class: "btn btn-primary", onclick: function () { edit(null); } }, [UI.icon("plus"), "Tambah vendor"]))); return; }
      var totBiaya = v.filter(function (x) { return x.status !== "incar"; }).reduce(function (a, x) { return a + (+x.biaya || 0); }, 0);
      var totBayar = v.reduce(function (a, x) { return a + (x.status === "lunas" ? (+x.biaya || 0) : (+x.dp || 0)); }, 0);
      var sisa = totBiaya - totBayar;
      root.appendChild(UI.el("div", { class: "cards", style: "margin-bottom:18px" }, [
        UI.statCard({ label: "Vendor dibooking", value: v.filter(function (x) { return x.status !== "incar"; }).length + "/" + v.length, icon: "briefcase" }),
        UI.statCard({ label: "Total biaya", value: totBiaya, fmt: UI.money, icon: "receipt-2" }),
        UI.statCard({ label: "Sudah dibayar", value: totBayar, fmt: UI.money, icon: "cash", color: "var(--ok)" }),
        UI.statCard({ label: "Sisa tagihan", value: sisa, fmt: UI.money, icon: "clock", color: sisa > 0 ? "var(--warn)" : "var(--ok)" })
      ]));
      var grid = UI.el("div", { class: "grid2" });
      v.forEach(function (x) {
        var sisaV = (+x.biaya || 0) - (x.status === "lunas" ? (+x.biaya || 0) : (+x.dp || 0));
        var card = UI.el("div", { class: "panel" }, [
          UI.el("div", { class: "flex between center", style: "margin-bottom:6px" }, [
            UI.el("div", {}, [UI.el("div", { class: "hint", style: "margin:0", text: x.jenis }), UI.el("div", { class: "panel-t", style: "margin:2px 0 0", text: x.nama })]),
            UI.el("button", { class: "btn btn-ghost btn-icon", onclick: function () { edit(x); } }, [UI.icon("dots")])
          ]),
          UI.el("div", { class: "flex center gap8", style: "margin:8px 0" }, [UI.tag(ST[x.status].l, ST[x.status].c), x.kontak ? UI.el("span", { class: "hint", style: "margin:0", text: "☎ " + x.kontak }) : null]),
          UI.el("table", { class: "tbl", style: "font-size:12.5px" }, [
            UI.el("tr", {}, [UI.el("td", { text: "Biaya" }), UI.el("td", { class: "num", text: UI.money(x.biaya) })]),
            UI.el("tr", {}, [UI.el("td", { text: "Dibayar" }), UI.el("td", { class: "num", text: UI.money(x.status === "lunas" ? x.biaya : x.dp) })]),
            UI.el("tr", {}, [UI.el("td", {}, [UI.el("b", { text: "Sisa" })]), UI.el("td", { class: "num", style: "color:" + (sisaV > 0 ? "var(--warn)" : "var(--ok)") }, [UI.el("b", { text: UI.money(sisaV) })])])
          ])
        ]);
        grid.appendChild(card);
      });
      root.appendChild(grid);
    }

    async function tipsAI() {
      if (!ctx.ai.hasKey()) { UI.toast("Isi API key dulu di Pengaturan", "err"); ctx.shell.openSettings(); return; }
      var box = UI.el("div", {}, [UI.spinner("Menganalisa vendor & anggaranmu…")]);
      var m = UI.modal("Tips Nego & Anggaran AI", box, { wide: true });
      try {
        var v = vendors();
        var rows = v.map(function (x) { return x.jenis + " " + x.nama + ": " + UI.money(x.biaya) + " (" + ST[x.status].l + ")"; }).join("; ");
        var out = await ctx.ai.ask({
          system: ctx.brain.context() + "\nKamu wedding planner berpengalaman di Indonesia. Beri saran realistis: vendor mana yang porsinya terlalu besar, 2 tips nego sopan yang biasa berhasil, dan 1 hal yang sering dilupakan pasangan. Maks 6 kalimat mengalir.",
          prompt: "Vendor & biayaku: " + (rows || "-") + ". Analisa & beri tips.", temp: 0.8
        });
        UI.clear(box); box.appendChild(UI.briefing(UI.esc(out), { title: "Saran Wedding Planner", icon: "briefcase" }));
      } catch (e) { UI.clear(box); box.appendChild(UI.el("div", { class: "empty", text: e.message })); }
    }

    function edit(x) {
      var isNew = !x; x = x || { id: uid(), jenis: "Katering", nama: "", kontak: "", biaya: 0, dp: 0, status: "incar" };
      var jenis = UI.select(["Venue", "Katering", "Dekorasi", "Foto & Video", "MUA & Busana", "Undangan", "Souvenir", "Entertainment", "Lainnya"].map(function (j) { return { v: j, l: j }; }), x.jenis);
      var nama = UI.input({ val: x.nama, ph: "Nama vendor" });
      var kontak = UI.input({ val: x.kontak, ph: "No. HP / IG" });
      var biaya = UI.input({ type: "number", val: x.biaya || "", ph: "0" });
      var dp = UI.input({ type: "number", val: x.dp || "", ph: "0" });
      var status = UI.select([{ v: "incar", l: "Diincar" }, { v: "dp", l: "Sudah DP" }, { v: "lunas", l: "Lunas" }], x.status);
      var body = UI.el("div", {}, [UI.el("div", { class: "grid2" }, [UI.field("Jenis", jenis), UI.field("Status", status)]), UI.field("Nama vendor", nama), UI.field("Kontak", kontak), UI.el("div", { class: "grid2" }, [UI.field("Total biaya (Rp)", biaya), UI.field("Sudah DP (Rp)", dp)])]);
      var save = UI.el("button", { class: "btn btn-primary", text: isNew ? "Tambah" : "Simpan" });
      var del = isNew ? null : UI.el("button", { class: "btn btn-danger", text: "Hapus" });
      body.appendChild(UI.el("div", { class: "row", style: "justify-content:space-between;margin-top:6px" }, [del || UI.el("span"), save]));
      var m = UI.modal(isNew ? "Vendor Baru" : "Edit Vendor", body);
      save.addEventListener("click", function () { if (!nama.value.trim()) { UI.toast("Isi nama", "err"); return; } x.jenis = jenis.value; x.nama = nama.value.trim(); x.kontak = kontak.value.trim(); x.biaya = +biaya.value || 0; x.dp = +dp.value || 0; x.status = status.value; if (isNew) S.push("sig_vendors", x); else S.update("sig_vendors", x.id, x); m.close(); render(); });
      if (del) del.addEventListener("click", function () { m.close(); UI.confirm("Hapus vendor?", "", function () { S.remove("sig_vendors", x.id); render(); }, { danger: true }); });
    }
    render();
  }
});
