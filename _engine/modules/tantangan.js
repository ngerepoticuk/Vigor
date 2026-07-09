/* tantangan.js — Tantangan 7/30 hari (universal): pilih template niche
   (spec.challenges + generik), centang harian, progres grid, selesai → confetti.
   Data: sig_challenges [{id,nama,hari,mulai,icon,warna,log:{iso:1},status}]. */
window.Shell.register({
  id: "tantangan", nama: "Tantangan", icon: "flag-bolt",
  mount: function (root, ctx) {
    var UI = ctx.ui, S = ctx.store, spec = ctx.spec;
    function all() { return S.get("sig_challenges", []); }
    function iso(d) { var x = new Date(d); x.setHours(0, 0, 0, 0); return x.toISOString().slice(0, 10); }
    function today() { return iso(new Date()); }
    function dayN(c) { return Math.floor((new Date(today()) - new Date(c.mulai)) / 864e5) + 1; }
    function doneCount(c) { return Object.keys(c.log || {}).length; }

    var GENERIC = [
      { nama: "7 Hari Bangun Pagi", hari: 7, icon: "sunrise", warna: "#fbbf24", desc: "Bangun sebelum jam 6 tiap hari." },
      { nama: "30 Hari Tanpa Skip", hari: 30, icon: "flame", warna: "#f97316", desc: "Semua kebiasaan tercentang tiap hari." },
      { nama: "7 Hari Digital Sunset", hari: 7, icon: "moon", warna: "#a78bfa", desc: "Tanpa layar 30 menit sebelum tidur." }
    ];
    function templates() { return (spec.challenges || []).concat(GENERIC); }

    function render() {
      UI.clear(root);
      var arr = all();
      root.appendChild(UI.viewHead("Tantangan", "Uji dirimu", UI.el("button", { class: "btn btn-primary", onclick: pick }, [UI.icon("plus"), "Mulai Tantangan"])));
      var active = arr.filter(function (c) { return c.status === "aktif"; });
      var doneArr = arr.filter(function (c) { return c.status === "selesai"; });
      if (!arr.length) {
        root.appendChild(UI.empty("Belum ada tantangan.<br>Tantangan 7/30 hari = cara paling cepat membangun momentum. Pilih satu, buktikan ke dirimu.", UI.el("button", { class: "btn btn-primary", onclick: pick }, [UI.icon("flag-bolt"), "Pilih tantangan"])));
        return;
      }
      active.forEach(function (c) { root.appendChild(card(c)); });
      if (doneArr.length) {
        root.appendChild(UI.el("div", { class: "kick", style: "margin-top:20px", text: "Selesai (" + doneArr.length + ") 🏆" }));
        doneArr.forEach(function (c) { root.appendChild(card(c)); });
      }
    }

    function card(c) {
      var d = dayN(c), total = c.hari, done = doneCount(c);
      var pct = Math.round(done / total * 100);
      var t = today(), checkedToday = !!(c.log && c.log[t]);
      var over = d > total;
      var el = UI.el("div", { class: "panel", style: "margin-bottom:14px" + (c.status === "selesai" ? ";opacity:.85" : "") });
      el.appendChild(UI.el("div", { class: "flex between center", style: "margin-bottom:10px" }, [
        UI.el("div", { class: "flex center gap12" }, [
          UI.el("div", { class: "tpl-ic", style: "background:" + (c.warna || "var(--primary)") }, [UI.icon(c.icon || "flag")]),
          UI.el("div", {}, [UI.el("div", { class: "panel-t", style: "margin:0", text: c.nama }),
            UI.el("div", { class: "hint", style: "margin:0", text: c.status === "selesai" ? "Selesai! " + done + "/" + total + " hari ✓" : "Hari ke-" + Math.min(d, total) + " dari " + total + " · " + done + " tercentang" })])
        ]),
        c.status === "aktif" ? UI.el("button", { class: "btn " + (checkedToday ? "btn-ghost" : "btn-primary") + " btn-sm", onclick: function () {
          c.log = c.log || {};
          if (c.log[t]) delete c.log[t]; else c.log[t] = 1;
          if (doneCount(c) >= total) { c.status = "selesai"; if (window.Onboard) Onboard.confetti(); UI.toast("🏆 Tantangan selesai! Kamu membuktikannya.", "ok"); }
          S.update("sig_challenges", c.id, c); render();
        } }, [UI.icon(checkedToday ? "check" : "circle-check"), checkedToday ? "Hari ini ✓" : "Centang hari ini"]) :
          UI.el("button", { class: "btn btn-ghost btn-icon", onclick: function () { UI.confirm("Hapus tantangan?", "", function () { S.remove("sig_challenges", c.id); render(); }, { danger: true }); } }, [UI.icon("trash")])
      ]));
      // grid hari
      var grid = UI.el("div", { class: "chal-grid" });
      for (var i = 0; i < total; i++) {
        var dd = new Date(c.mulai); dd.setDate(dd.getDate() + i);
        var di = iso(dd), on = !!(c.log && c.log[di]), isToday = di === t, future = di > t;
        grid.appendChild(UI.el("span", { class: "chal-day" + (on ? " on" : "") + (isToday ? " today" : "") + (future ? " future" : ""), title: di, text: i + 1 }));
      }
      el.appendChild(grid);
      el.appendChild(UI.el("div", { style: "margin-top:12px" }, [UI.progress(pct, { color: c.warna })]));
      if (c.status === "aktif" && over && done < total) el.appendChild(UI.el("div", { class: "hint", style: "margin-top:8px", text: "Periode lewat — tapi kamu masih bisa melengkapi atau mulai ulang. Tak apa. 💪" }));
      return el;
    }

    function pick() {
      var body = UI.el("div", {});
      body.appendChild(UI.el("p", { class: "hint", text: "Pilih tantangan — mulai hari ini. Centang tiap hari kamu berhasil." }));
      templates().forEach(function (tp) {
        body.appendChild(UI.el("div", { class: "tpl-card", style: "margin-bottom:10px" }, [
          UI.el("div", { class: "tpl-ic", style: "background:" + (tp.warna || "var(--primary)") }, [UI.icon(tp.icon || "flag")]),
          UI.el("div", { style: "flex:1" }, [UI.el("div", { class: "tpl-t", text: tp.nama }), UI.el("div", { class: "hint", style: "margin:3px 0 0", text: (tp.desc || "") + " · " + tp.hari + " hari" })]),
          UI.el("button", { class: "btn btn-primary btn-sm", onclick: function () { S.push("sig_challenges", { id: uid(), nama: tp.nama, hari: tp.hari, icon: tp.icon, warna: tp.warna, mulai: today(), log: {}, status: "aktif" }); m.close(); render(); UI.toast("Tantangan dimulai — semangat! 🔥", "ok"); } }, [UI.icon("flag-bolt"), "Mulai"])
        ]));
      });
      var m = UI.modal("Pilih Tantangan", body, { wide: true });
    }

    render();
  }
});
