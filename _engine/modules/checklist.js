/* checklist.js — pusat "kerjakan": Rutinitas (ritual harian tercentang),
   Tugas (to-do prioritas+tenggat), Proyek (checklist bertahap), Template
   (paket checklist niche siap pasang). Data: routines/routineLog/tasks/projects. */
window.Shell.register({
  id: "checklist", nama: "Checklist", icon: "checklist",
  mount: function (root, ctx) {
    var UI = ctx.ui, S = ctx.store, spec = ctx.spec;
    var tab = S.get("__cltab", "rutinitas");
    var t = todayISO();

    function todayISO() { var d = new Date(); d.setHours(0, 0, 0, 0); return d.toISOString().slice(0, 10); }

    function render() {
      UI.clear(root);
      root.appendChild(UI.viewHead("Checklist & Tugas", "Kerjakan", null));
      var seg = UI.el("div", { class: "seg", style: "margin-bottom:20px;flex-wrap:wrap" });
      [["rutinitas", "Rutinitas", "sun"], ["tugas", "Tugas", "checkbox"], ["proyek", "Proyek", "layout-kanban"], ["template", "Template", "layout-grid"]].forEach(function (x) {
        seg.appendChild(UI.el("button", { class: tab === x[0] ? "on" : "", onclick: function () { tab = x[0]; S.set("__cltab", tab); render(); } }, [UI.icon(x[2]), x[1]]));
      });
      root.appendChild(seg);
      var body = UI.el("div", {});
      root.appendChild(body);
      ({ rutinitas: rutinitas, tugas: tugas, proyek: proyek, template: template })[tab](body);
    }

    /* ============ RUTINITAS ============ */
    function rLog() { return S.get("routineLog", {}); }
    function rDone(rid, idx, day) { var l = rLog(); return !!(l[day] && l[day][rid + ":" + idx]); }
    function rToggle(rid, idx, day) { var l = rLog(); l[day] = l[day] || {}; var k = rid + ":" + idx; if (l[day][k]) delete l[day][k]; else l[day][k] = 1; S.set("routineLog", l); }
    function rStreak(r) {
      var l = rLog(), s = 0, d = new Date(); d.setHours(0, 0, 0, 0);
      function full(day) { var iso = day.toISOString().slice(0, 10); return r.items.length && r.items.every(function (_, i) { return l[iso] && l[iso][r.id + ":" + i]; }); }
      if (!full(d)) d.setDate(d.getDate() - 1);
      while (full(d)) { s++; d.setDate(d.getDate() - 1); }
      return s;
    }

    function rutinitas(body) {
      var routines = S.get("routines", []);
      body.appendChild(UI.el("div", { class: "flex between center", style: "margin-bottom:14px" }, [
        UI.el("div", { class: "hint", style: "margin:0", text: "Ritual kecil yang memberi harimu awalan menang." }),
        UI.el("button", { class: "btn btn-primary btn-sm", onclick: function () { editRoutine(null); } }, [UI.icon("plus"), "Rutinitas"])
      ]));
      if (!routines.length) { body.appendChild(UI.empty("Belum ada rutinitas.<br>Coba mulai dari ritual pagi 3 langkah — atau pasang dari tab <b>Template</b>.", UI.el("button", { class: "btn btn-primary", onclick: function () { editRoutine(null); } }, [UI.icon("plus"), "Buat rutinitas"]))); return; }
      routines.forEach(function (r) {
        var doneN = r.items.filter(function (_, i) { return rDone(r.id, i, t); }).length;
        var pct = r.items.length ? Math.round(doneN / r.items.length * 100) : 0;
        var card = UI.el("div", { class: "rt-card" });
        card.appendChild(UI.el("div", { class: "rt-head" }, [
          UI.el("div", { class: "rt-ring" }, [UI.ringz(pct, { size: 46, stroke: 5, label: doneN + "/" + r.items.length })]),
          UI.el("div", { style: "flex:1;min-width:0" }, [
            UI.el("div", { class: "rt-title", text: r.nama }),
            UI.el("div", { class: "hmeta" }, [UI.el("span", { text: waktuLabel(r.waktu) }), UI.el("span", { text: "🔥 " + rStreak(r) + " hari" })])
          ]),
          UI.el("button", { class: "btn btn-ghost btn-icon", title: "Edit", onclick: function () { editRoutine(r); } }, [UI.icon("dots")])
        ]));
        var items = UI.el("div", { class: "rt-items" });
        r.items.forEach(function (it, i) {
          var on = rDone(r.id, i, t);
          var row = UI.el("button", { class: "rt-item" + (on ? " on" : ""), onclick: function () { rToggle(r.id, i, t); render(); } }, [
            UI.el("span", { class: "rt-check" }, [UI.icon("check")]), UI.el("span", { text: it.t })
          ]);
          items.appendChild(row);
        });
        card.appendChild(items);
        if (pct === 100) card.appendChild(UI.el("div", { class: "rt-done", text: "✨ Rutinitas selesai — mantap!" }));
        body.appendChild(card);
      });
    }
    function waktuLabel(w) { return w === "pagi" ? "🌅 Pagi" : w === "malam" ? "🌙 Malam" : w === "siang" ? "☀️ Siang" : "⭐ Kapan saja"; }

    function editRoutine(r) {
      var isNew = !r; r = r ? JSON.parse(JSON.stringify(r)) : { id: uid(), nama: "", waktu: "pagi", items: [] };
      var nama = UI.input({ val: r.nama, ph: "mis. Rutinitas Pagi" });
      var waktu = UI.select([{ v: "pagi", l: "🌅 Pagi" }, { v: "siang", l: "☀️ Siang" }, { v: "malam", l: "🌙 Malam" }, { v: "kapan", l: "⭐ Kapan saja" }], r.waktu);
      var itemsWrap = UI.el("div", { class: "stack", style: "gap:8px" });
      function drawItems() {
        UI.clear(itemsWrap);
        r.items.forEach(function (it, i) {
          var inp = UI.input({ val: it.t, ph: "Langkah…" });
          inp.addEventListener("input", function () { it.t = inp.value; });
          itemsWrap.appendChild(UI.el("div", { class: "flex center gap8" }, [UI.icon("grip-vertical"), inp, UI.el("button", { class: "btn btn-ghost btn-icon", onclick: function () { r.items.splice(i, 1); drawItems(); } }, [UI.icon("x")])]));
        });
        itemsWrap.appendChild(UI.el("button", { class: "btn btn-ghost btn-sm", onclick: function () { r.items.push({ t: "" }); drawItems(); } }, [UI.icon("plus"), "Langkah"]));
      }
      drawItems();
      var body = UI.el("div", {}, [UI.field("Nama rutinitas", nama), UI.field("Waktu", waktu), UI.el("label", { class: "fld" }, [UI.el("span", { text: "Langkah-langkah" }), itemsWrap])]);
      var save = UI.el("button", { class: "btn btn-primary", text: isNew ? "Buat" : "Simpan" });
      var del = isNew ? null : UI.el("button", { class: "btn btn-danger", text: "Hapus" });
      body.appendChild(UI.el("div", { class: "row", style: "justify-content:space-between;margin-top:8px" }, [del || UI.el("span"), save]));
      var m = UI.modal(isNew ? "Rutinitas Baru" : "Edit Rutinitas", body);
      save.addEventListener("click", function () {
        if (!nama.value.trim()) { UI.toast("Isi nama dulu", "err"); return; }
        r.nama = nama.value.trim(); r.waktu = waktu.value; r.items = r.items.filter(function (x) { return x.t.trim(); });
        var arr = S.get("routines", []); var i = arr.map(function (x) { return x.id; }).indexOf(r.id); if (i >= 0) arr[i] = r; else arr.push(r); S.set("routines", arr);
        m.close(); render(); UI.toast("Tersimpan", "ok");
      });
      if (del) del.addEventListener("click", function () { m.close(); UI.confirm("Hapus rutinitas?", "Riwayatnya ikut hilang.", function () { S.remove("routines", r.id); render(); }, { danger: true }); });
    }

    /* ============ TUGAS ============ */
    var PRI = { tinggi: { l: "Tinggi", c: "var(--danger)" }, sedang: { l: "Sedang", c: "var(--warn)" }, rendah: { l: "Rendah", c: "var(--muted)" } };
    function tugas(body) {
      var tasks = S.get("tasks", []);
      // input cepat
      var inp = UI.input({ ph: "Tambah tugas… (Enter)" });
      var pri = UI.select([{ v: "sedang", l: "Sedang" }, { v: "tinggi", l: "Tinggi" }, { v: "rendah", l: "Rendah" }], "sedang");
      var due = UI.input({ type: "date" });
      function add() {
        if (!inp.value.trim()) return;
        S.push("tasks", { id: uid(), teks: inp.value.trim(), prioritas: pri.value, tenggat: due.value || "", done: false, t: Date.now() });
        inp.value = ""; due.value = ""; render(); setTimeout(function () { var n = root.querySelector(".tk-add input"); if (n) n.focus(); }, 30);
      }
      inp.addEventListener("keydown", function (e) { if (e.key === "Enter") add(); });
      body.appendChild(UI.el("div", { class: "tk-add", style: "display:flex;gap:8px;margin-bottom:18px;flex-wrap:wrap" }, [
        UI.el("div", { style: "flex:1;min-width:180px" }, [inp]),
        UI.el("div", { style: "width:120px" }, [pri]), UI.el("div", { style: "width:150px" }, [due]),
        UI.el("button", { class: "btn btn-primary", onclick: add }, [UI.icon("plus")])
      ]));

      var undone = tasks.filter(function (x) { return !x.done; });
      var done = tasks.filter(function (x) { return x.done; });
      var rank = { tinggi: 0, sedang: 1, rendah: 2 };
      undone.sort(function (a, b) { if (a.tenggat && b.tenggat && a.tenggat !== b.tenggat) return a.tenggat < b.tenggat ? -1 : 1; if (a.tenggat && !b.tenggat) return -1; if (!a.tenggat && b.tenggat) return 1; return rank[a.prioritas] - rank[b.prioritas]; });

      if (!tasks.length) { body.appendChild(UI.empty("Belum ada tugas. Tulis di atas & tekan Enter — selesai dalam sekejap.")); return; }
      // stat
      body.appendChild(UI.el("div", { class: "cards", style: "margin-bottom:16px" }, [
        UI.statCard({ label: "Belum selesai", value: undone.length, icon: "checkbox" }),
        UI.statCard({ label: "Selesai", value: done.length, icon: "circle-check" }),
        UI.statCard({ label: "Jatuh tempo ≤3h", value: undone.filter(function (x) { return x.tenggat && daysTo(x.tenggat) <= 3; }).length, icon: "alarm" })
      ]));
      undone.forEach(function (x) { body.appendChild(taskRow(x)); });
      if (done.length) {
        body.appendChild(UI.el("div", { class: "kick", style: "margin-top:20px", text: "Selesai (" + done.length + ")" }));
        done.slice(0, 12).forEach(function (x) { body.appendChild(taskRow(x)); });
        body.appendChild(UI.el("button", { class: "btn btn-ghost btn-sm", style: "margin-top:10px", onclick: function () { UI.confirm("Bersihkan tugas selesai?", "Menghapus " + done.length + " tugas yang sudah dicentang.", function () { S.set("tasks", S.get("tasks", []).filter(function (x) { return !x.done; })); render(); }, { danger: true }); } }, [UI.icon("trash"), "Bersihkan yang selesai"]));
      }
    }
    function daysTo(iso) { return Math.round((new Date(iso) - new Date().setHours(0, 0, 0, 0)) / 864e5); }
    function taskRow(x) {
      var over = x.tenggat && !x.done && daysTo(x.tenggat) < 0;
      var soon = x.tenggat && !x.done && daysTo(x.tenggat) >= 0 && daysTo(x.tenggat) <= 3;
      var chk = UI.el("button", { class: "hcheck" + (x.done ? " on" : ""), style: "width:30px;height:30px;border-radius:10px" }, [UI.icon("check")]);
      chk.addEventListener("click", function () { x.done = !x.done; x.doneAt = x.done ? Date.now() : null; S.update("tasks", x.id, x); if (x.done) UI.toast("Selesai ✓", "ok"); render(); });
      var meta = UI.el("div", { class: "hmeta" }, [
        UI.tag(PRI[x.prioritas].l, PRI[x.prioritas].c),
        x.tenggat ? UI.el("span", { style: over ? "color:var(--danger);font-weight:700" : (soon ? "color:var(--warn);font-weight:700" : ""), text: "⌛ " + UI.fmtDate(x.tenggat, true) + (over ? " (lewat)" : soon ? " (" + daysTo(x.tenggat) + "h)" : "") }) : null
      ]);
      return UI.el("div", { class: "hrow" + (x.done ? " tk-done" : "") }, [
        chk, UI.el("div", { style: "flex:1;min-width:0" }, [UI.el("div", { class: "hname", text: x.teks }), meta]),
        UI.el("button", { class: "btn btn-ghost btn-icon", title: "Hapus", onclick: function () { S.remove("tasks", x.id); render(); } }, [UI.icon("x")])
      ]);
    }

    /* ============ PROYEK ============ */
    function proyek(body) {
      var projects = S.get("projects", []);
      body.appendChild(UI.el("div", { class: "flex between center", style: "margin-bottom:14px" }, [
        UI.el("div", { class: "hint", style: "margin:0", text: "Pecah hal besar jadi langkah tercentang." }),
        UI.el("button", { class: "btn btn-primary btn-sm", onclick: function () { addProject(); } }, [UI.icon("plus"), "Proyek"])
      ]));
      if (!projects.length) { body.appendChild(UI.empty("Belum ada proyek.<br>mis. \"Rapikan keuangan\" atau \"Siapkan lomba\" — lalu daftar langkahnya.", UI.el("button", { class: "btn btn-primary", onclick: function () { addProject(); } }, [UI.icon("plus"), "Buat proyek"]))); return; }
      var grid = UI.el("div", { class: "grid2" });
      projects.forEach(function (p) {
        var doneN = p.items.filter(function (i) { return i.done; }).length, pct = p.items.length ? Math.round(doneN / p.items.length * 100) : 0;
        var col = p.warna || "var(--primary)";
        var card = UI.el("div", { class: "pj-card" });
        card.appendChild(UI.el("div", { class: "pj-head" }, [
          UI.el("div", { style: "flex:1" }, [UI.el("div", { class: "pj-title", text: p.nama }), UI.el("div", { class: "hint", style: "margin:2px 0 0", text: doneN + "/" + p.items.length + " langkah · " + pct + "%" })]),
          UI.el("button", { class: "btn btn-ghost btn-icon", onclick: function () { UI.confirm("Hapus proyek?", "\"" + p.nama + "\" akan dihapus.", function () { S.remove("projects", p.id); render(); }, { danger: true }); } }, [UI.icon("trash")])
        ]));
        card.appendChild(UI.el("div", { style: "margin:10px 0 12px" }, [UI.progress(pct, { color: col })]));
        var items = UI.el("div", {});
        p.items.forEach(function (it, i) {
          items.appendChild(UI.el("div", { class: "sub-item" + (it.done ? " done" : "") }, [
            UI.el("button", { class: "hcheck", style: "width:22px;height:22px;border-radius:7px", onclick: function () { it.done = !it.done; S.update("projects", p.id, p); render(); } }, [it.done ? UI.icon("check") : null]),
            UI.el("span", { style: "flex:1", text: it.t }),
            UI.el("span", { class: "hint", style: "margin:0;cursor:pointer", text: "✕", onclick: function () { p.items.splice(i, 1); S.update("projects", p.id, p); render(); } })
          ]));
        });
        card.appendChild(items);
        var addInp = UI.input({ ph: "+ langkah, lalu Enter" }); addInp.style.marginTop = "8px";
        addInp.addEventListener("keydown", function (e) { if (e.key === "Enter" && addInp.value.trim()) { p.items.push({ t: addInp.value.trim(), done: false }); S.update("projects", p.id, p); render(); } });
        card.appendChild(addInp);
        if (pct === 100 && p.items.length) card.appendChild(UI.el("div", { class: "rt-done", style: "margin-top:10px", text: "🎉 Proyek tuntas!" }));
        grid.appendChild(card);
      });
      body.appendChild(grid);
    }
    function addProject() {
      var nama = UI.input({ ph: "Nama proyek…" });
      var body = UI.el("div", {}, [UI.field("Nama proyek", nama)]);
      var save = UI.el("button", { class: "btn btn-primary", text: "Buat" }); body.appendChild(UI.el("div", { class: "row", style: "justify-content:flex-end" }, [save]));
      var m = UI.modal("Proyek Baru", body);
      save.addEventListener("click", function () { if (!nama.value.trim()) { UI.toast("Isi nama", "err"); return; } S.push("projects", { id: uid(), nama: nama.value.trim(), warna: "var(--primary)", items: [], t: Date.now() }); m.close(); render(); });
    }

    /* ============ TEMPLATE ============ */
    function template(body) {
      var tpls = (spec.checklistTemplates || []).concat(GENERIC);
      body.appendChild(UI.el("p", { class: "hint", text: "Paket checklist siap pakai. Sekali klik, langsung terpasang & bisa kamu ubah." }));
      var grid = UI.el("div", { class: "grid2", style: "margin-top:14px" });
      tpls.forEach(function (tp) {
        var card = UI.el("div", { class: "tpl-card" }, [
          UI.el("div", { class: "tpl-ic", style: "background:" + (tp.warna || "var(--primary)") }, [UI.icon(tp.icon || "list-check")]),
          UI.el("div", { style: "flex:1" }, [
            UI.el("div", { class: "tpl-t", text: tp.nama }),
            UI.el("div", { class: "hint", style: "margin:3px 0 0", text: (tp.jenis === "proyek" ? "Proyek" : "Rutinitas " + waktuLabel(tp.waktu || "kapan")) + " · " + tp.items.length + " langkah" }),
            UI.el("div", { class: "tpl-prev", text: tp.items.slice(0, 3).join(" · ") + (tp.items.length > 3 ? " …" : "") })
          ]),
          UI.el("button", { class: "btn btn-primary btn-sm", onclick: function () { installTpl(tp); } }, [UI.icon("download"), "Pasang"])
        ]);
        grid.appendChild(card);
      });
      body.appendChild(grid);
    }
    function installTpl(tp) {
      if (tp.jenis === "proyek") { S.push("projects", { id: uid(), nama: tp.nama, warna: tp.warna || "var(--primary)", items: tp.items.map(function (t) { return { t: t, done: false }; }), t: Date.now() }); UI.toast("Proyek dipasang ✓", "ok"); tab = "proyek"; }
      else { S.push("routines", { id: uid(), nama: tp.nama, waktu: tp.waktu || "kapan", items: tp.items.map(function (t) { return { t: t }; }) }); UI.toast("Rutinitas dipasang ✓", "ok"); tab = "rutinitas"; }
      S.set("__cltab", tab); render();
    }
    var GENERIC = [
      { jenis: "rutinitas", nama: "Ritual Pagi Berenergi", waktu: "pagi", icon: "sunrise", warna: "#fbbf24", items: ["Minum 1 gelas air", "Rapikan tempat tidur", "Peregangan 3 menit", "Tulis 1 niat hari ini", "Tanpa HP 30 menit pertama"] },
      { jenis: "rutinitas", nama: "Tutup Hari Tenang", waktu: "malam", icon: "moon", warna: "#a78bfa", items: ["Beresin meja & besok", "Tulis 3 syukur", "Baca 10 halaman", "Layar mati 30 menit sebelum tidur"] },
      { jenis: "proyek", nama: "Reset Digital Detox", icon: "device-mobile-off", warna: "#38bdf8", items: ["Matikan notifikasi non-penting", "Rapikan home screen", "Unsubscribe email sampah", "Tetapkan jam bebas layar", "Evaluasi seminggu"] },
      { jenis: "proyek", nama: "Deep Clean Rumah", icon: "home", warna: "#34d399", items: ["Bereskan lemari pakaian", "Dapur & kulkas", "Meja kerja", "Dokumen penting", "Donasi barang tak terpakai"] }
    ];

    render();
  }
});
