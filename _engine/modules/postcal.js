/* postcal.js — SIGNATURE Muse: kalender posting bulanan dari Pipeline Konten
   (sig_content.tanggal) + drop cepat ide ke tanggal. */
window.Shell.register({
  id: "postcal", nama: "Kalender Posting", icon: "calendar-bolt",
  mount: function (root, ctx) {
    var UI = ctx.ui, S = ctx.store;
    var cur = new Date(); cur.setDate(1); cur.setHours(0, 0, 0, 0);
    var STC = { ide: "#fbbf24", produksi: "#38bdf8", jadwal: "#a78bfa", terbit: "#34d399" };
    function iso(d) { return new Date(d).toISOString().slice(0, 10); }
    function content() { return S.get("sig_content", []); }

    function render() {
      UI.clear(root);
      root.appendChild(UI.el("div", { class: "view-head" }, [
        UI.el("div", {}, [UI.el("div", { class: "kick", text: "Konten" }), UI.el("h1", { class: "h1", text: UI.BULAN[cur.getMonth()] + " " + cur.getFullYear() })]),
        UI.el("div", { class: "row gap8" }, [
          UI.el("button", { class: "btn btn-ghost btn-icon", onclick: function () { cur.setMonth(cur.getMonth() - 1); render(); } }, [UI.icon("chevron-left")]),
          UI.el("button", { class: "btn btn-ghost btn-sm", onclick: function () { cur = new Date(); cur.setDate(1); render(); } }, ["Bulan ini"]),
          UI.el("button", { class: "btn btn-ghost btn-icon", onclick: function () { cur.setMonth(cur.getMonth() + 1); render(); } }, [UI.icon("chevron-right")])
        ])
      ]));
      // ritme target
      var mKey = cur.getFullYear() + "-" + cur.getMonth();
      var monthPosts = content().filter(function (x) { var d = x.tanggal ? new Date(x.tanggal) : null; return d && d.getFullYear() + "-" + d.getMonth() === mKey; });
      root.appendChild(UI.el("div", { class: "cards", style: "margin-bottom:16px" }, [
        UI.statCard({ label: "Terjadwal bulan ini", value: monthPosts.filter(function (x) { return x.status === "jadwal"; }).length, icon: "calendar-bolt", color: "#a78bfa" }),
        UI.statCard({ label: "Terbit bulan ini", value: monthPosts.filter(function (x) { return x.status === "terbit"; }).length, icon: "circle-check", color: "#34d399" }),
        UI.statCard({ label: "Ritme", value: monthPosts.length ? (30 / Math.max(1, monthPosts.length)).toFixed(1) : "—", fmt: null, icon: "activity" })
      ]));
      var grid = UI.el("div", { class: "cal" });
      ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].forEach(function (d) { grid.appendChild(UI.el("div", { class: "cal-dow", text: d })); });
      var start = new Date(cur); var lead = (start.getDay() + 6) % 7; start.setDate(start.getDate() - lead);
      var t = iso(new Date());
      for (var i = 0; i < 42; i++) {
        var d = new Date(start); d.setDate(start.getDate() + i);
        var di = iso(d), inMonth = d.getMonth() === cur.getMonth();
        var posts = content().filter(function (x) { return x.tanggal === di; });
        var cell = UI.el("button", { class: "cal-cell" + (inMonth ? "" : " out") + (di === t ? " today" : ""), onclick: (function (day, ps) { return function () { dayView(day, ps); }; })(di, posts) });
        cell.appendChild(UI.el("div", { class: "cal-num", text: d.getDate() }));
        var marks = UI.el("div", { class: "cal-marks" });
        posts.slice(0, 3).forEach(function (p) { marks.appendChild(UI.el("span", { class: "cal-ev", style: "background:" + (STC[p.status] || "var(--primary)"), title: p.judul })); });
        if (posts.length > 3) marks.appendChild(UI.el("span", { class: "cal-task", text: "+" + (posts.length - 3) }));
        cell.appendChild(marks);
        grid.appendChild(cell);
      }
      root.appendChild(grid);
      root.appendChild(UI.el("div", { class: "cal-legend" }, Object.keys(STC).map(function (k) { return UI.el("span", { class: "cal-lg" }, [UI.el("i", { style: "background:" + STC[k] }), k]); })));
    }

    function dayView(di, posts) {
      var body = UI.el("div", {});
      if (posts.length) posts.forEach(function (p) {
        body.appendChild(UI.el("div", { class: "hrow" }, [
          UI.el("span", { class: "cal-ev", style: "width:10px;height:10px;background:" + (STC[p.status] || "var(--primary)") }),
          UI.el("div", { style: "flex:1" }, [UI.el("div", { class: "hname", text: p.judul }), UI.el("div", { class: "hmeta" }, [UI.el("span", { text: p.platform }), UI.el("span", { text: p.status })])])
        ]));
      });
      else body.appendChild(UI.el("div", { class: "hint", text: "Belum ada konten di tanggal ini." }));
      var judul = UI.input({ ph: "Jadwalkan konten baru di tanggal ini…" });
      judul.addEventListener("keydown", function (e) { if (e.key === "Enter" && judul.value.trim()) { S.push("sig_content", { id: uid(), judul: judul.value.trim(), platform: "TikTok", status: "jadwal", tanggal: di }); m.close(); render(); UI.toast("Terjadwal ✓", "ok"); } });
      body.appendChild(UI.el("div", { style: "margin-top:12px" }, [judul]));
      var m = UI.modal(UI.fmtDate(di, true), body);
    }
    render();
  }
});
