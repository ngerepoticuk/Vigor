/* fab.js — tombol + melayang global: quick-add tugas / catatan / agenda
   dari halaman mana pun, tanpa pindah menu. + aksi khas app via spec.quickAdd. */
window.Fab = (function () {
  var open = false, elFab, elMenu;

  function actions() {
    var base = [
      { ic: "checkbox", label: "Tugas", run: quickTask },
      { ic: "notes", label: "Catatan", run: quickNote },
      { ic: "calendar-event", label: "Agenda", run: quickEvent }
    ];
    var extra = (APP.spec && APP.spec.quickAdd) || [];
    // extra: [{ic,label,go}] -> lompat ke modul
    extra.forEach(function (x) { base.unshift({ ic: x.ic, label: x.label, run: function () { Shell.go(x.go); } }); });
    return base;
  }

  function quickTask() {
    var inp = UI.input({ ph: "Apa yang perlu dikerjakan?" });
    var pri = UI.select([{ v: "sedang", l: "Sedang" }, { v: "tinggi", l: "Tinggi" }, { v: "rendah", l: "Rendah" }], "sedang");
    var due = UI.input({ type: "date" });
    var body = UI.el("div", {}, [UI.field("Tugas", inp), UI.el("div", { class: "grid2" }, [UI.field("Prioritas", pri), UI.field("Tenggat (opsional)", due)])]);
    var save = UI.el("button", { class: "btn btn-primary", text: "Simpan" }); body.appendChild(UI.el("div", { class: "row", style: "justify-content:flex-end;margin-top:6px" }, [save]));
    var m = UI.modal("Tugas Cepat", body);
    setTimeout(function () { inp.focus(); }, 60);
    function doSave() { if (!inp.value.trim()) { UI.toast("Isi dulu", "err"); return; } Store.push("tasks", { id: uid(), teks: inp.value.trim(), prioritas: pri.value, tenggat: due.value || "", done: false, t: Date.now() }); m.close(); UI.toast("Tugas ditambahkan ✓", "ok"); }
    save.addEventListener("click", doSave);
    inp.addEventListener("keydown", function (e) { if (e.key === "Enter") doSave(); });
  }
  function quickNote() {
    var inp = UI.textarea({ ph: "Tulis apa saja…", rows: 4 });
    var body = UI.el("div", {}, [UI.field("Catatan", inp)]);
    var save = UI.el("button", { class: "btn btn-primary", text: "Simpan" }); body.appendChild(UI.el("div", { class: "row", style: "justify-content:flex-end;margin-top:6px" }, [save]));
    var m = UI.modal("Catatan Cepat", body);
    setTimeout(function () { inp.focus(); }, 60);
    save.addEventListener("click", function () { if (!inp.value.trim()) { UI.toast("Isi dulu", "err"); return; } var arr = Store.get("notes", []); arr.unshift({ id: uid(), judul: "", teks: inp.value.trim(), tags: [], pin: false, t: Date.now() }); Store.set("notes", arr); m.close(); UI.toast("Catatan tersimpan ✓", "ok"); });
  }
  function quickEvent() {
    var teks = UI.input({ ph: "Agenda apa?" });
    var tgl = UI.input({ type: "date", val: new Date().toISOString().slice(0, 10) });
    var body = UI.el("div", {}, [UI.field("Agenda", teks), UI.field("Tanggal", tgl)]);
    var save = UI.el("button", { class: "btn btn-primary", text: "Simpan" }); body.appendChild(UI.el("div", { class: "row", style: "justify-content:flex-end;margin-top:6px" }, [save]));
    var m = UI.modal("Agenda Cepat", body);
    setTimeout(function () { teks.focus(); }, 60);
    save.addEventListener("click", function () { if (!teks.value.trim()) { UI.toast("Isi dulu", "err"); return; } Store.push("events", { id: uid(), iso: tgl.value, teks: teks.value.trim(), warna: "var(--primary)" }); m.close(); UI.toast("Agenda tersimpan ✓", "ok"); });
  }

  function toggle(force) {
    open = force != null ? force : !open;
    elFab.classList.toggle("open", open);
    elMenu.classList.toggle("show", open);
  }

  function init() {
    elMenu = UI.el("div", { class: "fab-menu" });
    actions().forEach(function (a, i) {
      var b = UI.el("button", { class: "fab-item", style: "transition-delay:" + (i * 0.03) + "s", onclick: function () { toggle(false); a.run(); } }, [
        UI.el("span", { class: "fab-item-lbl", text: a.label }), UI.el("span", { class: "fab-item-ic" }, [UI.icon(a.ic)])
      ]);
      elMenu.appendChild(b);
    });
    elFab = UI.el("button", { class: "fab", title: "Tambah cepat", onclick: function () { toggle(); } }, [UI.icon("plus")]);
    document.body.appendChild(elMenu);
    document.body.appendChild(elFab);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && open) toggle(false); });
    document.addEventListener("click", function (e) { if (open && !e.target.closest(".fab") && !e.target.closest(".fab-menu")) toggle(false); });
  }
  return { init: init };
})();
