/* ide.js — SIGNATURE Muse: bank ide & hook konten per kategori + tandai favorit.
   Kirim ide ke Pipeline Konten. Data: sig_ideas [{id,teks,kategori,fav}]. */
(window.SIG_SEEDERS = window.SIG_SEEDERS || []).push(function (S, spec, u) {
  if (spec.kind !== "content") return;
  var d = [
    { teks: "\"POV: kamu baru mulai dan takut jelek\"", kategori: "Hook", fav: true },
    { teks: "\"3 kesalahan yang aku sesali sebagai pemula\"", kategori: "Hook" },
    { teks: "Tutorial: edit 1 video dalam 5 menit", kategori: "Tutorial" },
    { teks: "Day in the life sebagai kreator", kategori: "Storytelling" },
    { teks: "Reaksi ke tren terbaru di niche-ku", kategori: "Tren" },
    { teks: "Q&A: jawab pertanyaan tersulit dari followers", kategori: "Engagement" }
  ];
  S.set("sig_ideas", d.map(function (x, i) { return Object.assign({ id: u.id() + i, fav: !!x.fav }, x); }));
});
window.Shell.register({
  id: "ide", nama: "Bank Ide", icon: "bulb",
  mount: function (root, ctx) {
    var UI = ctx.ui, S = ctx.store;
    var filter = "";
    function all() { return S.get("sig_ideas", []); }

    function render() {
      UI.clear(root);
      var arr = all();
      root.appendChild(UI.viewHead("Bank Ide & Hook", "Konten", UI.el("button", { class: "btn btn-primary", onclick: function () { edit(null); } }, [UI.icon("plus"), "Ide"])));
      if (!arr.length) { root.appendChild(UI.empty("Bank ide kosong.<br>Simpan setiap ide random di sini — jangan andalkan ingatan. Nanti tinggal ambil saat butuh.", UI.el("button", { class: "btn btn-primary", onclick: function () { edit(null); } }, [UI.icon("plus"), "Simpan ide pertama"]))); return; }
      var kats = {}; arr.forEach(function (x) { kats[x.kategori] = (kats[x.kategori] || 0) + 1; });
      var bar = UI.el("div", { class: "row gap8", style: "margin-bottom:18px" });
      bar.appendChild(UI.el("button", { class: "chip" + (filter === "" ? " on" : ""), text: "Semua " + arr.length, onclick: function () { filter = ""; render(); } }));
      bar.appendChild(UI.el("button", { class: "chip" + (filter === "__fav" ? " on" : ""), text: "★ Favorit", onclick: function () { filter = "__fav"; render(); } }));
      Object.keys(kats).forEach(function (k) { bar.appendChild(UI.el("button", { class: "chip" + (filter === k ? " on" : ""), text: k + " " + kats[k], onclick: function () { filter = k; render(); } })); });
      root.appendChild(bar);

      var list = arr.filter(function (x) { return filter === "" ? true : filter === "__fav" ? x.fav : x.kategori === filter; });
      var grid = UI.el("div", { class: "grid2" });
      list.forEach(function (x) {
        var card = UI.el("div", { class: "idea-card" }, [
          UI.el("div", { class: "flex between center", style: "margin-bottom:8px" }, [
            UI.tag(x.kategori, "var(--primary)"),
            UI.el("button", { class: "note-act", onclick: function () { x.fav = !x.fav; S.update("sig_ideas", x.id, x); render(); } }, [UI.icon(x.fav ? "star-filled" : "star")])
          ]),
          UI.el("div", { class: "idea-teks", text: x.teks }),
          UI.el("div", { class: "row gap8", style: "margin-top:12px" }, [
            UI.el("button", { class: "btn btn-ghost btn-sm", onclick: function () { toKonten(x); } }, [UI.icon("arrow-right"), "Jadikan konten"]),
            UI.el("button", { class: "btn btn-ghost btn-sm", onclick: function () { edit(x); } }, [UI.icon("edit")]),
            UI.el("button", { class: "btn btn-ghost btn-sm", onclick: function () { UI.confirm("Hapus ide?", "", function () { S.remove("sig_ideas", x.id); render(); }, { danger: true }); } }, [UI.icon("trash")])
          ])
        ]);
        grid.appendChild(card);
      });
      root.appendChild(grid);
    }
    function toKonten(x) {
      S.push("sig_content", { id: uid(), judul: x.teks.replace(/^"|"$/g, ""), platform: "TikTok", status: "ide", tanggal: "" });
      UI.toast("Dikirim ke Pipeline Konten ✓", "ok");
      if (ctx.go) ctx.go("konten");
    }
    function edit(x) {
      var isNew = !x; x = x || { id: uid(), teks: "", kategori: "Hook", fav: false };
      var teks = UI.textarea({ val: x.teks, ph: "Tulis ide / hook…", rows: 3 });
      var kat = UI.input({ val: x.kategori, ph: "mis. Hook, Tutorial, Tren" });
      var body = UI.el("div", {}, [UI.field("Ide", teks), UI.field("Kategori", kat)]);
      var save = UI.el("button", { class: "btn btn-primary", text: isNew ? "Simpan" : "Perbarui" });
      var del = isNew ? null : UI.el("button", { class: "btn btn-danger", text: "Hapus" });
      body.appendChild(UI.el("div", { class: "row", style: "justify-content:space-between;margin-top:6px" }, [del || UI.el("span"), save]));
      var m = UI.modal(isNew ? "Ide Baru" : "Edit Ide", body);
      save.addEventListener("click", function () { if (!teks.value.trim()) { UI.toast("Isi ide", "err"); return; } x.teks = teks.value.trim(); x.kategori = kat.value.trim() || "Umum"; if (isNew) S.push("sig_ideas", x); else S.update("sig_ideas", x.id, x); m.close(); render(); });
      if (del) del.addEventListener("click", function () { m.close(); UI.confirm("Hapus ide?", "", function () { S.remove("sig_ideas", x.id); render(); }, { danger: true }); });
    }
    render();
  }
});
