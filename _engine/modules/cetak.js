/* cetak.js — Studio Cetak: pilih template (harian/mingguan/laporan), pratinjau
   halaman siap-cetak yang cantik, lalu Cetak / Simpan PDF (window.print). */
window.Shell.register({
  id: "cetak", nama: "Cetak", icon: "printer",
  mount: function (root, ctx) {
    var UI = ctx.ui, S = ctx.store, I = ctx.intel, spec = ctx.spec;
    var pick = "harian";

    function render() {
      UI.clear(root);
      root.appendChild(UI.viewHead("Studio Cetak", "Planner fisik", null));
      root.appendChild(UI.el("p", { class: "hint", text: "Pilih halaman, lalu Cetak atau simpan sebagai PDF (di dialog cetak pilih \"Simpan sebagai PDF\"). Cocok ditempel di meja atau dijilid." }));

      var controls = UI.el("div", { class: "cetak-controls" }, [
        UI.el("div", { class: "seg" }, [
          segBtn("harian", "Rencana Harian", "sun"),
          segBtn("mingguan", "Rencana Mingguan", "layout-grid"),
          segBtn("laporan", "Laporan Progres", "chart-bar"),
          segBtn("bulanan", "Laporan Bulanan", "calendar-star")
        ]),
        UI.el("button", { class: "btn btn-primary", onclick: function () { window.print(); } }, [UI.icon("printer"), "Cetak / Simpan PDF"])
      ]);
      root.appendChild(controls);

      var stage = UI.el("div", { class: "print-stage" });
      var sheet = UI.el("div", { class: "print-sheet" });
      ({ harian: sheetHarian, mingguan: sheetMingguan, laporan: sheetLaporan, bulanan: sheetBulanan })[pick](sheet);
      stage.appendChild(sheet);
      root.appendChild(stage);
    }
    function segBtn(k, l, ic) { return UI.el("button", { class: pick === k ? "on" : "", onclick: function () { pick = k; render(); } }, [UI.icon(ic), l]); }

    function head(sheet, title, sub) {
      sheet.appendChild(UI.el("div", { class: "ps-head" }, [
        UI.el("div", {}, [UI.el("div", { class: "ps-brand", text: APP.nama }), UI.el("div", { class: "ps-title", text: title })]),
        UI.el("div", { class: "ps-date", text: sub })
      ]));
    }
    function line() { return UI.el("div", { class: "ps-line" }); }
    function box(n) { var w = UI.el("div", { class: "ps-boxes" }); for (var i = 0; i < (n || 1); i++) w.appendChild(UI.el("span", { class: "ps-box" })); return w; }

    /* ---- Rencana Harian ---- */
    function sheetHarian(sheet) {
      var now = new Date();
      var f = (S.get("focus", {}))[I.today()] || {};
      head(sheet, "Rencana Harian", now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }));
      // niat
      sheet.appendChild(UI.el("div", { class: "ps-strip" }, [UI.el("span", { class: "ps-lbl", text: "Niat hari ini" }), UI.el("span", { class: "ps-fill", text: f.niat || "" })]));
      var cols = UI.el("div", { class: "ps-cols" });
      // kiri: prioritas + jadwal
      var left = UI.el("div", {});
      left.appendChild(UI.el("div", { class: "ps-sec", text: "3 Prioritas Utama" }));
      for (var i = 0; i < 3; i++) { var it = (f.top || [])[i] || {}; left.appendChild(UI.el("div", { class: "ps-check" }, [UI.el("span", { class: "ps-box" }), UI.el("span", { class: "ps-fill", text: it.t || "" })])); }
      left.appendChild(UI.el("div", { class: "ps-sec", text: "Jadwal" }));
      var hours = ["06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21"];
      var blokMap = {}; (f.blok || []).forEach(function (b) { if (b.jam) blokMap[b.jam.slice(0, 2)] = b.teks; });
      hours.forEach(function (h) { left.appendChild(UI.el("div", { class: "ps-slot" }, [UI.el("span", { class: "ps-hour", text: h + ":00" }), UI.el("span", { class: "ps-fill", text: blokMap[h] || "" })])); });
      // kanan: kebiasaan + catatan
      var right = UI.el("div", {});
      right.appendChild(UI.el("div", { class: "ps-sec", text: "Kebiasaan" }));
      var hs = I.habits();
      (hs.length ? hs : [{ nama: "" }, { nama: "" }, { nama: "" }, { nama: "" }, { nama: "" }]).forEach(function (h) { right.appendChild(UI.el("div", { class: "ps-check" }, [UI.el("span", { class: "ps-box" }), UI.el("span", { class: "ps-fill", text: h.nama })])); });
      right.appendChild(UI.el("div", { class: "ps-sec", text: "Syukur hari ini" }));
      for (var g = 0; g < 3; g++) right.appendChild(UI.el("div", { class: "ps-check" }, [UI.el("span", { class: "ps-num", text: (g + 1) + "." }), UI.el("span", { class: "ps-fill" })]));
      right.appendChild(UI.el("div", { class: "ps-sec", text: "Catatan" }));
      for (var l = 0; l < 4; l++) right.appendChild(line());
      cols.appendChild(left); cols.appendChild(right);
      sheet.appendChild(cols);
      sheet.appendChild(UI.el("div", { class: "ps-foot", text: "“Konsistensi kecil hari ini, hidup besar setahun lagi.”  ·  " + APP.nama }));
    }

    /* ---- Rencana Mingguan ---- */
    function sheetMingguan(sheet) {
      var days = I.range(7); var start = new Date(days[0]), end = new Date(days[6]);
      head(sheet, "Rencana Mingguan", UI.fmtDate(start, false) + " – " + UI.fmtDate(end, true));
      // habit tracker grid
      sheet.appendChild(UI.el("div", { class: "ps-sec", text: "Pelacak Kebiasaan" }));
      var hs = I.habits();
      var tbl = UI.el("table", { class: "ps-tbl" });
      var hr = UI.el("tr", {}, [UI.el("th", { text: "Kebiasaan" })]);
      days.forEach(function (d) { hr.appendChild(UI.el("th", { class: "ps-th-day", text: UI.HARIS[new Date(d).getDay()] })); });
      tbl.appendChild(hr);
      (hs.length ? hs : [{}, {}, {}, {}, {}, {}]).forEach(function (h) {
        var tr = UI.el("tr", {}, [UI.el("td", { text: h.nama || "" })]);
        days.forEach(function (d) { tr.appendChild(UI.el("td", { class: "ps-cell" }, [UI.el("span", { class: "ps-box" + (h.id && I.isDone(h.id, d) ? " on" : "") })])); });
        tbl.appendChild(tr);
      });
      sheet.appendChild(tbl);
      // goals + notes
      var cols = UI.el("div", { class: "ps-cols" });
      var left = UI.el("div", {});
      left.appendChild(UI.el("div", { class: "ps-sec", text: "Fokus Sasaran Minggu Ini" }));
      var goals = S.get("goals", []).filter(function (g) { return g.status !== "arsip" && g.status !== "selesai"; }).slice(0, 4);
      (goals.length ? goals : [{}, {}, {}]).forEach(function (g) { left.appendChild(UI.el("div", { class: "ps-check" }, [UI.el("span", { class: "ps-box" }), UI.el("span", { class: "ps-fill", text: g.judul || "" })])); });
      var right = UI.el("div", {});
      right.appendChild(UI.el("div", { class: "ps-sec", text: "Catatan Minggu" }));
      for (var l = 0; l < 6; l++) right.appendChild(line());
      cols.appendChild(left); cols.appendChild(right);
      sheet.appendChild(cols);
      sheet.appendChild(UI.el("div", { class: "ps-foot", text: "Tinjau tiap Minggu — 5 menit yang menentukan arah minggu depan.  ·  " + APP.nama }));
    }

    /* ---- Laporan Progres ---- */
    function sheetLaporan(sheet) {
      var o = I.overview(), ls = o.life, ds = I.domainScores().filter(function (d) { return d.hasData; });
      head(sheet, "Laporan Progres", "Per " + new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }));
      var kpis = UI.el("div", { class: "ps-kpis" }, [
        psK((spec.scoreLabel || "Skor") + "", ls.score + "/100"),
        psK("Konsistensi 28h", o.consistency + "%"),
        psK("Streak terbaik", o.bestStreak + " hari"),
        psK("Sasaran aktif", o.goalActive + "")
      ]);
      sheet.appendChild(kpis);
      sheet.appendChild(UI.el("div", { class: "ps-sec", text: (spec.wheelLabel || "Skor Area") }));
      var bars = UI.el("div", { class: "ps-bars" });
      ds.forEach(function (d) { bars.appendChild(UI.el("div", { class: "ps-bar-row" }, [UI.el("span", { class: "ps-bar-lbl", text: d.label }), UI.el("span", { class: "ps-bar-track" }, [UI.el("span", { class: "ps-bar-fill", style: "width:" + d.val + "%" })]), UI.el("span", { class: "ps-bar-v", text: d.val })])); });
      sheet.appendChild(bars);
      // goals progress
      sheet.appendChild(UI.el("div", { class: "ps-sec", text: "Sasaran" }));
      var goals = S.get("goals", []).filter(function (g) { return g.status !== "arsip"; }).slice(0, 6);
      if (goals.length) goals.forEach(function (g) { bars = UI.el("div", { class: "ps-bar-row" }, [UI.el("span", { class: "ps-bar-lbl", text: g.judul }), UI.el("span", { class: "ps-bar-track" }, [UI.el("span", { class: "ps-bar-fill", style: "width:" + (g.progress || 0) + "%" })]), UI.el("span", { class: "ps-bar-v", text: (g.progress || 0) + "%" })]); sheet.appendChild(bars); });
      else sheet.appendChild(UI.el("div", { class: "hint", text: "Belum ada sasaran." }));
      sheet.appendChild(UI.el("div", { class: "ps-sec", text: "Refleksi & rencana perbaikan" }));
      for (var l = 0; l < 4; l++) sheet.appendChild(line());
      sheet.appendChild(UI.el("div", { class: "ps-foot", text: "Laporan otomatis " + APP.nama + " — apa yang terukur, membaik." }));
    }
    function psK(k, v) { return UI.el("div", { class: "ps-k" }, [UI.el("div", { class: "ps-k-v", text: v }), UI.el("div", { class: "ps-k-l", text: k })]); }

    /* ---- Laporan Bulanan (cantik, shareable) ---- */
    function sheetBulanan(sheet) {
      var now = new Date(), mKey = now.getFullYear() + "-" + now.getMonth();
      function inMonth(iso) { var d = new Date(iso); return d.getFullYear() + "-" + d.getMonth() === mKey; }
      var o = I.overview(), ls = o.life;
      var checks = S.get("checks", {}), mChecks = 0, mDays = {};
      Object.keys(checks).forEach(function (h) { Object.keys(checks[h]).forEach(function (d) { if (checks[h][d] && inMonth(d)) { mChecks++; mDays[d] = 1; } }); });
      var jn = S.get("journal", []).filter(function (j) { return j.iso && inMonth(j.iso); });
      var tasksDone = S.get("tasks", []).filter(function (t) { return t.done && t.doneAt && inMonth(new Date(t.doneAt).toISOString().slice(0, 10)); }).length;
      var goalsDone = S.get("goals", []).filter(function (g) { return g.status === "selesai"; }).length;
      var avgMood = jn.length ? (jn.reduce(function (a, j) { return a + (j.mood || 3); }, 0) / jn.length).toFixed(1) : null;

      // sampul bulan — header besar berwarna
      sheet.appendChild(UI.el("div", { class: "ps-cover" }, [
        UI.el("div", { class: "ps-cover-kick", text: APP.nama.toUpperCase() + " · LAPORAN BULANAN" }),
        UI.el("div", { class: "ps-cover-title", text: UI.BULAN[now.getMonth()] + " " + now.getFullYear() }),
        UI.el("div", { class: "ps-cover-sub", text: (ctx.brain.get().diri.nama || "Kamu") + " — sebulan perjalanan, terangkum di satu halaman." })
      ]));
      // KPI besar
      sheet.appendChild(UI.el("div", { class: "ps-kpis", style: "margin-top:16px" }, [
        psK(spec.scoreLabel || "Skor", ls.score + "/100"),
        psK("Total centang", mChecks + ""),
        psK("Hari aktif", Object.keys(mDays).length + ""),
        psK("Streak terbaik", o.bestStreak + " hr")
      ]));
      sheet.appendChild(UI.el("div", { class: "ps-kpis", style: "margin-top:10px" }, [
        psK("Tugas selesai", tasksDone + ""),
        psK("Hari berjurnal", jn.length + ""),
        psK("Mood rata-rata", avgMood != null ? avgMood + "/5" : "—"),
        psK("Sasaran tercapai", goalsDone + "")
      ]));
      // skor area
      var ds = I.domainScores().filter(function (d) { return d.hasData; });
      if (ds.length) {
        sheet.appendChild(UI.el("div", { class: "ps-sec", text: spec.wheelLabel || "Skor Area" }));
        var bars = UI.el("div", { class: "ps-bars" });
        ds.forEach(function (d) { bars.appendChild(UI.el("div", { class: "ps-bar-row" }, [UI.el("span", { class: "ps-bar-lbl", text: d.label }), UI.el("span", { class: "ps-bar-track" }, [UI.el("span", { class: "ps-bar-fill", style: "width:" + d.val + "%" })]), UI.el("span", { class: "ps-bar-v", text: d.val })])); });
        sheet.appendChild(bars);
      }
      // sasaran bulan ini
      var gs = S.get("goals", []).filter(function (g) { return g.status !== "arsip"; }).slice(0, 5);
      if (gs.length) {
        sheet.appendChild(UI.el("div", { class: "ps-sec", text: "Progres Sasaran" }));
        var b2 = UI.el("div", { class: "ps-bars" });
        gs.forEach(function (g) { b2.appendChild(UI.el("div", { class: "ps-bar-row" }, [UI.el("span", { class: "ps-bar-lbl", text: g.judul }), UI.el("span", { class: "ps-bar-track" }, [UI.el("span", { class: "ps-bar-fill", style: "width:" + (g.progress || 0) + "%" })]), UI.el("span", { class: "ps-bar-v", text: (g.progress || 0) + "%" })])); });
        sheet.appendChild(b2);
      }
      // refleksi tulis tangan
      sheet.appendChild(UI.el("div", { class: "ps-cols", style: "margin-top:6px" }, [
        UI.el("div", {}, [UI.el("div", { class: "ps-sec", text: "3 kemenangan bulan ini" }), box3()]),
        UI.el("div", {}, [UI.el("div", { class: "ps-sec", text: "Fokus bulan depan" }), box3()])
      ]));
      function box3() { var w = UI.el("div", {}); for (var i = 0; i < 3; i++) w.appendChild(UI.el("div", { class: "ps-check" }, [UI.el("span", { class: "ps-num", text: (i + 1) + "." }), UI.el("span", { class: "ps-fill" })])); return w; }
      sheet.appendChild(UI.el("div", { class: "ps-foot", text: "“Apa yang terukur, membaik.” — " + APP.nama + " · " + UI.fmtDate(new Date(), true) }));
    }

    render();
  }
});
