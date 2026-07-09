/* konten.js — SIGNATURE Muse: papan pipeline konten (Ide → Produksi → Terjadwal
   → Terbit) + platform + tanggal. Data: sig_content [{id,judul,platform,status,tanggal}]. */
(window.SIG_SEEDERS = window.SIG_SEEDERS || []).push(function (S, spec, u) {
  if (spec.kind !== "content") return;
  var c = [
    { judul: "5 tips produktif buat kreator", platform: "TikTok", status: "ide" },
    { judul: "Behind the scenes editing", platform: "Reels", status: "ide" },
    { judul: "Kolaborasi dengan brand X", platform: "YouTube", status: "produksi" },
    { judul: "Tutorial lighting murah", platform: "Reels", status: "jadwal", tanggal: u.iso(u.shift(2)) },
    { judul: "Q&A subscriber", platform: "YouTube", status: "terbit", tanggal: u.iso(u.shift(-3)) }
  ];
  S.set("sig_content", c.map(function (x, i) { return { id: u.id() + i, judul: x.judul, platform: x.platform, status: x.status, tanggal: x.tanggal || "" }; }));
});
window.Shell.register({
  id: "konten", nama: "Pipeline Konten", icon: "layout-kanban",
  mount: function (root, ctx) {
    var UI = ctx.ui, S = ctx.store;
    var COLS = [["ide", "💡 Ide", "#fbbf24"], ["produksi", "🎬 Produksi", "#38bdf8"], ["jadwal", "📅 Terjadwal", "#a78bfa"], ["terbit", "✅ Terbit", "#34d399"]];
    function all() { return S.get("sig_content", []); }

    function render() {
      UI.clear(root);
      var arr = all();
      root.appendChild(UI.viewHead("Pipeline Konten", "Konten", UI.el("button", { class: "btn btn-primary", onclick: function () { edit(null); } }, [UI.icon("plus"), "Konten"])));
      if (!arr.length) { root.appendChild(UI.empty("Papan konten kosong.<br>Tuang ide, lalu geser dari Ide → Produksi → Terjadwal → Terbit.", UI.el("button", { class: "btn btn-primary", onclick: function () { edit(null); } }, [UI.icon("plus"), "Tambah ide"]))); return; }
      root.appendChild(UI.el("div", { class: "cards", style: "margin-bottom:18px" }, COLS.map(function (c) {
        return UI.statCard({ label: c[1], value: arr.filter(function (x) { return x.status === c[0]; }).length, color: c[2] });
      })));
      var board = UI.el("div", { class: "kanban" });
      COLS.forEach(function (c) {
        var col = UI.el("div", { class: "kb-col" });
        col.appendChild(UI.el("div", { class: "kb-head" }, [UI.el("span", { class: "kb-dot", style: "background:" + c[2] }), UI.el("b", { text: c[1] }), UI.el("span", { class: "hint", style: "margin:0 0 0 auto", text: arr.filter(function (x) { return x.status === c[0]; }).length + "" })]));
        arr.filter(function (x) { return x.status === c[0]; }).forEach(function (x) {
          var idx = COLS.map(function (cc) { return cc[0]; }).indexOf(x.status);
          var card = UI.el("div", { class: "kb-card", onclick: function (e) { if (e.target.closest(".kb-move")) return; edit(x); } });
          card.appendChild(UI.el("div", { class: "kb-title", text: x.judul }));
          card.appendChild(UI.el("div", { class: "kb-meta" }, [UI.tag(x.platform || "-", c[2]), x.tanggal ? UI.el("span", { class: "hint", style: "margin:0", text: "📅 " + UI.fmtDate(x.tanggal, true) }) : null]));
          var mv = UI.el("div", { class: "kb-move" }, [
            idx > 0 ? UI.el("button", { class: "btn btn-ghost btn-icon", title: "Mundur", onclick: function () { x.status = COLS[idx - 1][0]; S.update("sig_content", x.id, x); render(); } }, [UI.icon("chevron-left")]) : UI.el("span"),
            idx < 3 ? UI.el("button", { class: "btn btn-ghost btn-icon", title: "Maju", onclick: function () { x.status = COLS[idx + 1][0]; S.update("sig_content", x.id, x); render(); } }, [UI.icon("chevron-right")]) : UI.el("span")
          ]);
          card.appendChild(mv);
          col.appendChild(card);
        });
        col.appendChild(UI.el("button", { class: "kb-add", onclick: function () { edit({ status: c[0] }); } }, [UI.icon("plus"), "Tambah"]));
        board.appendChild(col);
      });
      root.appendChild(board);
    }

    function edit(x) {
      var isNew = !x || !x.id; var status0 = x && x.status ? x.status : "ide"; x = (x && x.id) ? x : { id: uid(), judul: "", platform: "TikTok", status: status0, tanggal: "" };
      var judul = UI.input({ val: x.judul, ph: "Judul / ide konten" });
      var plat = UI.select(["TikTok", "Reels", "YouTube", "Shorts", "Feed IG", "Thread", "Blog"].map(function (p) { return { v: p, l: p }; }), x.platform);
      var stat = UI.select(COLS.map(function (c) { return { v: c[0], l: c[1] }; }), x.status);
      var tgl = UI.input({ type: "date", val: x.tanggal });
      var aiBox = UI.el("div", {});
      var aiBtn = UI.el("button", { class: "btn btn-ghost btn-sm", onclick: async function () {
        if (!ctx.ai.hasKey()) { UI.toast("Isi API key dulu di Pengaturan", "err"); ctx.shell.openSettings(); return; }
        if (!judul.value.trim()) { UI.toast("Isi judul dulu", "err"); return; }
        UI.clear(aiBox); aiBox.appendChild(UI.spinner("Menulis script…"));
        try {
          var out = await ctx.ai.ask({
            system: ctx.brain.context() + "\nKamu scriptwriter konten pendek berpengalaman. Tulis script video 30-60 detik: HOOK 3 detik pertama yang kuat, ISI 3 poin ringkas, CTA penutup. Format teks biasa dengan label HOOK/ISI/CTA. Bahasa santai, engaging.",
            prompt: 'Judul konten: "' + judul.value + '" untuk ' + plat.value + ".", temp: 0.9
          });
          UI.clear(aiBox); aiBox.appendChild(UI.el("div", { class: "ai-out", style: "margin-top:10px", text: out }));
          aiBox.appendChild(UI.el("button", { class: "btn btn-ghost btn-sm", style: "margin-top:8px", onclick: function () { var arr = ctx.store.get("notes", []); arr.unshift({ id: uid(), judul: "Script: " + judul.value, teks: out, tags: ["script"], pin: false, t: Date.now() }); ctx.store.set("notes", arr); UI.toast("Script disimpan ke Catatan ✓", "ok"); } }, [UI.icon("device-floppy"), "Simpan ke Catatan"]));
        } catch (e) { UI.clear(aiBox); aiBox.appendChild(UI.el("div", { class: "empty", text: e.message })); }
      } }, [UI.icon("sparkles"), "Generate Script (AI)"]);
      var body = UI.el("div", {}, [UI.field("Judul konten", judul), UI.el("div", { class: "grid2" }, [UI.field("Platform", plat), UI.field("Status", stat)]), UI.field("Tanggal tayang (opsional)", tgl), aiBtn, aiBox]);
      var save = UI.el("button", { class: "btn btn-primary", text: isNew ? "Tambah" : "Simpan" });
      var del = isNew ? null : UI.el("button", { class: "btn btn-danger", text: "Hapus" });
      body.appendChild(UI.el("div", { class: "row", style: "justify-content:space-between;margin-top:6px" }, [del || UI.el("span"), save]));
      var m = UI.modal(isNew ? "Konten Baru" : "Edit Konten", body);
      save.addEventListener("click", function () { if (!judul.value.trim()) { UI.toast("Isi judul", "err"); return; } x.judul = judul.value.trim(); x.platform = plat.value; x.status = stat.value; x.tanggal = tgl.value; if (isNew) S.push("sig_content", x); else S.update("sig_content", x.id, x); m.close(); render(); });
      if (del) del.addEventListener("click", function () { m.close(); UI.confirm("Hapus konten?", "", function () { S.remove("sig_content", x.id); render(); }, { danger: true }); });
    }
    render();
  }
});
