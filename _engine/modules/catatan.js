/* catatan.js — brain-dump: catatan bebas dengan judul, tag, pin, pencarian.
   Data: notes [{id,t,judul,teks,tags:[],pin}]. */
window.Shell.register({
  id: "catatan", nama: "Catatan", icon: "notes",
  mount: function (root, ctx) {
    var UI = ctx.ui, S = ctx.store;
    var q = "", tagF = "";

    function all() { return S.get("notes", []); }
    function render() {
      UI.clear(root);
      root.appendChild(UI.viewHead("Catatan & Ide", "Brain-dump", UI.el("button", { class: "btn btn-primary", onclick: function () { edit(null); } }, [UI.icon("plus"), "Catatan"])));
      var notes = all();
      if (!notes.length) { root.appendChild(UI.empty("Kepala penuh? Tuang di sini.<br>Ide, kutipan, rencana, uneg-uneg — apa saja, biar pikiran lebih lega.", UI.el("button", { class: "btn btn-primary", onclick: function () { edit(null); } }, [UI.icon("plus"), "Tulis catatan pertama"]))); return; }

      // search + tags
      var search = UI.input({ ph: "Cari catatan…", val: q }); search.addEventListener("input", function () { q = search.value; draw(); });
      var tags = {}; notes.forEach(function (n) { (n.tags || []).forEach(function (t) { tags[t] = (tags[t] || 0) + 1; }); });
      var tagBar = UI.el("div", { class: "row gap8", style: "margin:12px 0 18px" });
      tagBar.appendChild(UI.el("button", { class: "chip" + (tagF === "" ? " on" : ""), text: "Semua", onclick: function () { tagF = ""; render(); } }));
      Object.keys(tags).forEach(function (t) { tagBar.appendChild(UI.el("button", { class: "chip" + (tagF === t ? " on" : ""), text: "#" + t + " " + tags[t], onclick: function () { tagF = t; render(); } })); });
      root.appendChild(search); root.appendChild(tagBar);

      var masonry = UI.el("div", { class: "notes-grid" });
      root.appendChild(masonry);
      draw();

      function draw() {
        UI.clear(masonry);
        var ql = q.toLowerCase();
        var filtered = notes.filter(function (n) {
          if (tagF && (n.tags || []).indexOf(tagF) < 0) return false;
          if (ql && (n.judul + " " + n.teks + " " + (n.tags || []).join(" ")).toLowerCase().indexOf(ql) < 0) return false;
          return true;
        }).sort(function (a, b) { return (b.pin ? 1 : 0) - (a.pin ? 1 : 0) || b.t - a.t; });
        if (!filtered.length) { masonry.appendChild(UI.el("div", { class: "hint", text: "Tidak ada catatan yang cocok." })); return; }
        filtered.forEach(function (n) {
          var card = UI.el("div", { class: "note-card" + (n.pin ? " pin" : ""), onclick: function (e) { if (e.target.closest(".note-act")) return; edit(n); } });
          card.appendChild(UI.el("div", { class: "note-top" }, [
            n.judul ? UI.el("div", { class: "note-title", text: n.judul }) : UI.el("span"),
            UI.el("button", { class: "note-act", title: n.pin ? "Lepas pin" : "Pin", onclick: function () { n.pin = !n.pin; S.update("notes", n.id, n); render(); } }, [UI.icon(n.pin ? "pinned-filled" : "pin")])
          ]));
          if (n.teks) card.appendChild(UI.el("div", { class: "note-body", text: n.teks }));
          if (n.tags && n.tags.length) card.appendChild(UI.el("div", { class: "note-tags" }, n.tags.map(function (t) { return UI.el("span", { class: "note-tag", text: "#" + t }); })));
          masonry.appendChild(card);
        });
      }
    }

    function edit(n) {
      var isNew = !n; n = n || { id: uid(), judul: "", teks: "", tags: [], pin: false, t: Date.now() };
      var judul = UI.input({ val: n.judul, ph: "Judul (opsional)" });
      var teks = UI.textarea({ val: n.teks, ph: "Tulis apa saja…", rows: 7 });
      var tags = UI.input({ val: (n.tags || []).join(", "), ph: "tag dipisah koma, mis. ide, kerja" });
      var body = UI.el("div", {}, [UI.field("Judul", judul), UI.field("Isi", teks), UI.field("Tag", tags)]);
      var save = UI.el("button", { class: "btn btn-primary", text: isNew ? "Simpan" : "Perbarui" });
      var del = isNew ? null : UI.el("button", { class: "btn btn-danger", text: "Hapus" });
      body.appendChild(UI.el("div", { class: "row", style: "justify-content:space-between;margin-top:6px" }, [del || UI.el("span"), save]));
      var m = UI.modal(isNew ? "Catatan Baru" : "Edit Catatan", body, { wide: true });
      save.addEventListener("click", function () {
        if (!judul.value.trim() && !teks.value.trim()) { UI.toast("Tulis sesuatu dulu", "err"); return; }
        n.judul = judul.value.trim(); n.teks = teks.value.trim(); n.tags = tags.value.split(",").map(function (s) { return s.trim(); }).filter(Boolean); n.t = n.t || Date.now();
        var arr = S.get("notes", []); var i = arr.map(function (x) { return x.id; }).indexOf(n.id); if (i >= 0) arr[i] = n; else arr.unshift(n); S.set("notes", arr);
        m.close(); render(); UI.toast("Tersimpan", "ok");
      });
      if (del) del.addEventListener("click", function () { m.close(); UI.confirm("Hapus catatan?", "", function () { S.remove("notes", n.id); render(); }, { danger: true }); });
    }

    render();
  }
});
