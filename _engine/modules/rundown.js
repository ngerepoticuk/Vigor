/* rundown.js — SIGNATURE Ikrar: susunan acara hari-H (jam, kegiatan, PIC, status).
   Data: sig_rundown [{id,jam,kegiatan,pic,done}]. */
(window.SIG_SEEDERS = window.SIG_SEEDERS || []).push(function (S, spec, u) {
  if (spec.kind !== "wedding") return;
  var r = [
    { jam: "06:00", kegiatan: "Makeup & persiapan pengantin", pic: "MUA" },
    { jam: "08:00", kegiatan: "Akad nikah", pic: "Keluarga & penghulu" },
    { jam: "10:00", kegiatan: "Sesi foto keluarga", pic: "Fotografer" },
    { jam: "11:00", kegiatan: "Resepsi dimulai", pic: "MC" },
    { jam: "13:00", kegiatan: "Hiburan & ramah tamah", pic: "MC & WO" },
    { jam: "15:00", kegiatan: "Penutupan & bersih-bersih", pic: "Panitia" }
  ];
  S.set("sig_rundown", r.map(function (x, i) { return Object.assign({ id: u.id() + i, done: false }, x); }));
});
window.Shell.register({
  id: "rundown", nama: "Rundown Acara", icon: "list-numbers",
  mount: function (root, ctx) {
    var UI = ctx.ui, S = ctx.store;
    function items() { return S.get("sig_rundown", []).slice().sort(function (a, b) { return (a.jam || "99") < (b.jam || "99") ? -1 : 1; }); }

    function render() {
      UI.clear(root);
      var arr = items();
      root.appendChild(UI.viewHead("Rundown Hari-H", "Pernikahan", UI.el("button", { class: "btn btn-primary", onclick: function () { edit(null); } }, [UI.icon("plus"), "Acara"])));
      if (!arr.length) { root.appendChild(UI.empty("Rundown kosong.<br>Susun urutan acara hari-H: jam, kegiatan, siapa penanggung jawabnya.", UI.el("button", { class: "btn btn-primary", onclick: function () { edit(null); } }, [UI.icon("plus"), "Tambah acara"]))); return; }
      root.appendChild(UI.el("p", { class: "hint", style: "margin-bottom:16px", text: "Bagikan rundown ini ke MC, WO & keluarga — biar semua tahu perannya. (Cetak via Studio Cetak → laporan)" }));
      var tl = UI.el("div", { class: "moment-tl" });
      arr.forEach(function (x) {
        tl.appendChild(UI.el("div", { class: "moment" }, [
          UI.el("div", { class: "moment-dot", style: "background:" + (x.done ? "var(--ok)" : "var(--primary)") }),
          UI.el("div", { style: "flex:1" }, [
            UI.el("div", { class: "flex center gap8" }, [UI.el("b", { class: "mono", style: "font-size:13px", text: x.jam }), UI.el("b", { text: x.kegiatan }), x.done ? UI.tag("Beres", "var(--ok)") : null]),
            UI.el("div", { class: "hint", style: "margin:2px 0 0", text: "PIC: " + (x.pic || "-") })
          ]),
          UI.el("div", { class: "row gap8" }, [
            UI.el("button", { class: "btn btn-ghost btn-icon", title: "Tandai beres", onclick: function () { x.done = !x.done; S.update("sig_rundown", x.id, x); render(); } }, [UI.icon(x.done ? "rotate" : "check")]),
            UI.el("button", { class: "btn btn-ghost btn-icon", onclick: function () { edit(x); } }, [UI.icon("dots")])
          ])
        ]));
      });
      root.appendChild(tl);
    }
    function edit(x) {
      var isNew = !x; x = x || { id: uid(), jam: "08:00", kegiatan: "", pic: "", done: false };
      var jam = UI.el("input", { class: "input", type: "time", value: x.jam });
      var keg = UI.input({ val: x.kegiatan, ph: "mis. Akad nikah" });
      var pic = UI.input({ val: x.pic, ph: "Penanggung jawab" });
      var body = UI.el("div", {}, [UI.el("label", { class: "fld" }, [UI.el("span", { text: "Jam" }), jam]), UI.field("Kegiatan", keg), UI.field("PIC", pic)]);
      var save = UI.el("button", { class: "btn btn-primary", text: isNew ? "Tambah" : "Simpan" });
      var del = isNew ? null : UI.el("button", { class: "btn btn-danger", text: "Hapus" });
      body.appendChild(UI.el("div", { class: "row", style: "justify-content:space-between;margin-top:6px" }, [del || UI.el("span"), save]));
      var m = UI.modal(isNew ? "Acara Baru" : "Edit Acara", body);
      save.addEventListener("click", function () { if (!keg.value.trim()) { UI.toast("Isi kegiatan", "err"); return; } x.jam = jam.value; x.kegiatan = keg.value.trim(); x.pic = pic.value.trim(); if (isNew) S.push("sig_rundown", x); else S.update("sig_rundown", x.id, x); m.close(); render(); });
      if (del) del.addEventListener("click", function () { m.close(); UI.confirm("Hapus acara?", "", function () { S.remove("sig_rundown", x.id); render(); }, { danger: true }); });
    }
    render();
  }
});
