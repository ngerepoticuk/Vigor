/* kalender.js — tampilan bulan yang menggabungkan kebiasaan (intensitas),
   tugas jatuh tempo, jurnal (mood), dan event. Klik hari untuk detail + tambah event. */
window.Shell.register({
  id: "kalender", nama: "Kalender", icon: "calendar-event",
  mount: function (root, ctx) {
    var UI = ctx.ui, S = ctx.store, I = ctx.intel;
    var cur = new Date(); cur.setDate(1); cur.setHours(0, 0, 0, 0);

    function iso(d) { return new Date(d).toISOString().slice(0, 10); }
    function habitRatio(day) { var hs = I.habits(); if (!hs.length) return 0; var n = hs.filter(function (h) { return I.isDone(h.id, day); }).length; return n / hs.length; }
    function tasksOn(day) { return S.get("tasks", []).filter(function (x) { return x.tenggat === day; }); }
    function eventsOn(day) { return S.get("events", []).filter(function (e) { return e.iso === day; }); }
    function journalOn(day) { return S.get("journal", []).filter(function (j) { return j.iso === day; })[0]; }
    var MOODEMO = ["", "😔", "😕", "😐", "🙂", "😄"];

    function render() {
      UI.clear(root);
      var mLabel = UI.BULAN[cur.getMonth()] + " " + cur.getFullYear();
      root.appendChild(UI.el("div", { class: "view-head" }, [
        UI.el("div", {}, [UI.el("div", { class: "kick", text: "Kalender" }), UI.el("h1", { class: "h1", text: mLabel })]),
        UI.el("div", { class: "row gap8" }, [
          UI.el("button", { class: "btn btn-ghost btn-icon", onclick: function () { cur.setMonth(cur.getMonth() - 1); render(); } }, [UI.icon("chevron-left")]),
          UI.el("button", { class: "btn btn-ghost btn-sm", onclick: function () { cur = new Date(); cur.setDate(1); cur.setHours(0, 0, 0, 0); render(); } }, ["Hari ini"]),
          UI.el("button", { class: "btn btn-ghost btn-icon", onclick: function () { cur.setMonth(cur.getMonth() + 1); render(); } }, [UI.icon("chevron-right")]),
          UI.el("button", { class: "btn btn-primary btn-sm", onclick: function () { addEvent(iso(new Date())); } }, [UI.icon("plus"), "Event"])
        ])
      ]));

      var grid = UI.el("div", { class: "cal" });
      ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].forEach(function (d) { grid.appendChild(UI.el("div", { class: "cal-dow", text: d })); });
      var start = new Date(cur); var lead = (start.getDay() + 6) % 7;
      start.setDate(start.getDate() - lead);
      var todayISO = iso(new Date());
      for (var i = 0; i < 42; i++) {
        var d = new Date(start); d.setDate(start.getDate() + i);
        var di = iso(d), inMonth = d.getMonth() === cur.getMonth();
        if (i >= 35 && d.getMonth() !== cur.getMonth() && d > cur) { /* trim trailing empty week */ if (new Date(start.getFullYear(), start.getMonth(), start.getDate() + 35).getMonth() !== cur.getMonth() && i >= 35) {} }
        var ratio = habitRatio(di), tks = tasksOn(di), evs = eventsOn(di), j = journalOn(di);
        var cell = UI.el("button", { class: "cal-cell" + (inMonth ? "" : " out") + (di === todayISO ? " today" : ""), onclick: (function (day) { return function () { dayDetail(day); }; })(di) });
        cell.appendChild(UI.el("div", { class: "cal-num", text: d.getDate() }));
        if (ratio > 0) cell.appendChild(UI.el("div", { class: "cal-ring", style: "background:conic-gradient(var(--primary) " + Math.round(ratio * 360) + "deg, var(--line) 0)" }, [UI.el("i")]));
        var marks = UI.el("div", { class: "cal-marks" });
        if (j) marks.appendChild(UI.el("span", { class: "cal-mood", text: MOODEMO[j.mood] || "•" }));
        evs.slice(0, 2).forEach(function (e) { marks.appendChild(UI.el("span", { class: "cal-ev", style: "background:" + (e.warna || "var(--accent)"), title: e.teks })); });
        if (tks.length) marks.appendChild(UI.el("span", { class: "cal-task", text: "✓" + tks.length }));
        cell.appendChild(marks);
        grid.appendChild(cell);
      }
      root.appendChild(grid);

      // legenda
      root.appendChild(UI.el("div", { class: "cal-legend" }, [
        legend("var(--primary)", "cincin = kebiasaan selesai"),
        legend("var(--accent)", "titik = event"),
        legend("var(--warn)", "✓ = tugas jatuh tempo"),
        UI.el("span", { class: "hint", style: "margin:0", text: "😄 = mood dari jurnal" })
      ]));
    }
    function legend(c, t) { return UI.el("span", { class: "cal-lg" }, [UI.el("i", { style: "background:" + c }), t]); }

    function dayDetail(di) {
      var d = new Date(di);
      var hs = I.habits(), doneH = hs.filter(function (h) { return I.isDone(h.id, di); });
      var tks = tasksOn(di), evs = eventsOn(di), j = journalOn(di);
      var body = UI.el("div", {});
      if (hs.length) body.appendChild(UI.el("div", { class: "dd-sec" }, [UI.el("div", { class: "kick", text: "Kebiasaan" }), UI.el("div", { class: "hint", style: "margin:4px 0 0", text: doneH.length + "/" + hs.length + " selesai" + (doneH.length ? ": " + doneH.map(function (h) { return h.nama; }).join(", ") : "") })]));
      body.appendChild(UI.el("div", { class: "dd-sec" }, [UI.el("div", { class: "kick", text: "Event" }),
        evs.length ? UI.el("div", {}, evs.map(function (e) { return UI.el("div", { class: "flex center gap8", style: "padding:6px 0" }, [UI.el("span", { class: "cal-ev", style: "background:" + (e.warna || "var(--accent)") }), UI.el("span", { style: "flex:1", text: e.teks }), UI.el("span", { class: "hint", style: "margin:0;cursor:pointer", text: "✕", onclick: function () { S.remove("events", e.id); m.close(); render(); dayDetail(di); } })]); })) : UI.el("div", { class: "hint", style: "margin:4px 0 0", text: "Belum ada event." })]));
      if (tks.length) body.appendChild(UI.el("div", { class: "dd-sec" }, [UI.el("div", { class: "kick", text: "Tugas jatuh tempo" }), UI.el("div", {}, tks.map(function (x) { return UI.el("div", { class: "hint", style: "margin:4px 0 0", text: (x.done ? "✓ " : "○ ") + x.teks }); }))]));
      if (j) body.appendChild(UI.el("div", { class: "dd-sec" }, [UI.el("div", { class: "kick", text: "Jurnal" }), UI.el("div", { class: "hint", style: "margin:4px 0 0", text: (MOODEMO[j.mood] || "") + " " + (j.teks ? j.teks.slice(0, 120) : "(tanpa catatan)") })]));
      body.appendChild(UI.el("button", { class: "btn btn-primary", style: "margin-top:14px;width:100%", onclick: function () { m.close(); addEvent(di); } }, [UI.icon("plus"), "Tambah event di tanggal ini"]));
      var m = UI.modal(d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" }), body);
    }

    function addEvent(di) {
      var teks = UI.input({ ph: "Nama event / agenda…" });
      var tgl = UI.input({ type: "date", val: di });
      var cols = ["#7c5cff", "#f26d84", "#34d399", "#38bdf8", "#fbbf24"];
      var pick = { v: cols[0] };
      var sw = UI.el("div", { class: "row gap8" }, cols.map(function (c) { var b = UI.el("button", { class: "csw" + (c === pick.v ? " on" : ""), style: "background:" + c, onclick: function () { pick.v = c; Array.prototype.forEach.call(sw.children, function (x) { x.classList.remove("on"); }); b.classList.add("on"); } }); return b; }));
      var body = UI.el("div", {}, [UI.field("Agenda", teks), UI.field("Tanggal", tgl), UI.el("label", { class: "fld" }, [UI.el("span", { text: "Warna" }), sw])]);
      var save = UI.el("button", { class: "btn btn-primary", text: "Simpan" }); body.appendChild(UI.el("div", { class: "row", style: "justify-content:flex-end;margin-top:6px" }, [save]));
      var m = UI.modal("Event Baru", body);
      save.addEventListener("click", function () { if (!teks.value.trim()) { UI.toast("Isi agenda", "err"); return; } S.push("events", { id: uid(), iso: tgl.value, teks: teks.value.trim(), warna: pick.v }); m.close(); render(); UI.toast("Event ditambahkan", "ok"); });
    }

    render();
  }
});
