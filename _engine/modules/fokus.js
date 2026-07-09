/* fokus.js — Fokus Hari Ini: niat harian, 3 prioritas utama, blok waktu,
   tarik kebiasaan hari ini, susun-hari AI. Data per-tanggal di store "focus". */
window.Shell.register({
  id: "fokus", nama: "Fokus Hari Ini", icon: "sun-high",
  mount: function (root, ctx) {
    var UI = ctx.ui, S = ctx.store, I = ctx.intel, spec = ctx.spec;
    var t = I.today();

    function data() { var f = S.get("focus", {}); return f[t] || (f[t] = { niat: "", top: [], blok: [] }); }
    function save(d) { var f = S.get("focus", {}); f[t] = d; S.set("focus", f); }

    function render() {
      UI.clear(root);
      var d = data();
      root.appendChild(UI.viewHead("Fokus Hari Ini", new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" }),
        UI.el("button", { class: "btn btn-ghost", onclick: planDay }, [UI.icon("sparkles"), "Susun hariku (AI)"])));

      // niat
      var niat = UI.input({ val: d.niat, ph: spec.niatPh || "Niat / kata kunci hari ini… mis. Tenang & fokus" });
      niat.style.fontSize = "16px"; niat.addEventListener("change", function () { d.niat = niat.value; save(d); });
      root.appendChild(UI.el("div", { class: "panel", style: "margin-bottom:16px" }, [
        UI.el("div", { class: "kick", style: "margin-bottom:8px", text: "Niat Hari Ini" }), niat
      ]));

      root.appendChild(UI.el("div", { class: "split" }, [top3Panel(d), blokPanel(d)]));

      // kebiasaan hari ini
      var hs = I.habits();
      if (hs.length) {
        var hp = UI.el("div", { class: "panel", style: "margin-top:16px" }, [UI.el("div", { class: "panel-t", text: "Kebiasaan hari ini" })]);
        hs.forEach(function (h) {
          var done = I.isDone(h.id, t);
          var chk = UI.el("button", { class: "hcheck" + (done ? " on" : ""), style: "width:28px;height:28px;border-radius:9px" }, [UI.icon("check")]);
          chk.addEventListener("click", function () { var c = S.get("checks", {}); c[h.id] = c[h.id] || {}; if (c[h.id][t]) delete c[h.id][t]; else c[h.id][t] = 1; S.set("checks", c); chk.classList.toggle("on"); });
          hp.appendChild(UI.el("div", { class: "flex center gap12", style: "padding:7px 0" }, [chk, UI.el("span", { text: h.nama }), UI.el("span", { class: "hint right", style: "margin:0", text: "🔥 " + I.streakOf(h.id) })]));
        });
        root.appendChild(hp);
      }
    }

    function top3Panel(d) {
      var p = UI.el("div", { class: "panel" }, [UI.el("div", { class: "panel-t", text: "3 Prioritas Utama" }), UI.el("div", { class: "hint", text: "Kalau hanya 3 ini beres, harimu menang." })]);
      d.top = d.top || [];
      for (var i = 0; i < 3; i++) (function (i) {
        var item = d.top[i] || { t: "", done: false };
        var chk = UI.el("button", { class: "hcheck" + (item.done ? " on" : ""), style: "width:26px;height:26px;border-radius:8px" }, [UI.icon("check")]);
        var inp = UI.input({ val: item.t, ph: "Prioritas #" + (i + 1) });
        if (item.done) inp.style.textDecoration = "line-through", inp.style.opacity = ".6";
        chk.addEventListener("click", function () { d.top[i] = { t: inp.value, done: !item.done }; save(d); render(); });
        inp.addEventListener("change", function () { d.top[i] = { t: inp.value, done: item.done }; save(d); });
        p.appendChild(UI.el("div", { class: "flex center gap8", style: "margin-top:10px" }, [chk, inp]));
      })(i);
      return p;
    }

    function blokPanel(d) {
      var p = UI.el("div", { class: "panel" }, [UI.el("div", { class: "flex between center", style: "margin-bottom:6px" }, [UI.el("div", { class: "panel-t", style: "margin:0", text: "Blok Waktu" }), UI.el("button", { class: "btn btn-ghost btn-sm", onclick: function () { d.blok.push({ jam: "", teks: "", done: false }); save(d); render(); } }, [UI.icon("plus"), "Blok"])])]);
      d.blok = d.blok || [];
      if (!d.blok.length) p.appendChild(UI.el("div", { class: "hint", text: "Belum ada blok. Tambah untuk menata jammu." }));
      d.blok.forEach(function (bk, i) {
        var jam = UI.el("input", { class: "input", type: "time", style: "width:104px", value: bk.jam || "" });
        var teks = UI.input({ val: bk.teks, ph: "Kegiatan…" });
        var chk = UI.el("button", { class: "hcheck" + (bk.done ? " on" : ""), style: "width:26px;height:26px;border-radius:8px" }, [UI.icon("check")]);
        jam.addEventListener("change", function () { bk.jam = jam.value; save(d); });
        teks.addEventListener("change", function () { bk.teks = teks.value; save(d); });
        chk.addEventListener("click", function () { bk.done = !bk.done; save(d); render(); });
        p.appendChild(UI.el("div", { class: "flex center gap8", style: "margin-top:9px" }, [chk, jam, teks, UI.el("span", { class: "hint", style: "margin:0;cursor:pointer", text: "✕", onclick: function () { d.blok.splice(i, 1); save(d); render(); } })]));
      });
      // sort by jam
      if (d.blok.length > 1) d.blok.sort(function (a, b) { return (a.jam || "99") < (b.jam || "99") ? -1 : 1; });
      return p;
    }

    async function planDay() {
      if (!ctx.ai.hasKey()) { UI.toast("Isi API key dulu di Pengaturan", "err"); ctx.shell.openSettings(); return; }
      var d = data();
      var box = UI.el("div", {}, [UI.spinner("Menyusun rencana hari…")]);
      var m = UI.modal("Rencana Hari Ini", box, { wide: true });
      try {
        var hs = I.habits().map(function (h) { return h.nama; }).join(", ");
        var goals = S.get("goals", []).filter(function (g) { return g.status === "aktif"; }).slice(0, 5).map(function (g) { return g.judul; }).join("; ");
        var out = await ctx.ai.ask({
          system: ctx.brain.context() + "\nKamu asisten produktivitas. Susun rencana hari realistis: 3 prioritas + 4-6 blok waktu (pagi s/d malam). Hormati energi & kehidupan nyata, jangan berlebihan.",
          prompt: "Kebiasaan hari ini: " + (hs || "-") + ". Sasaran aktif: " + (goals || "-") + ". Niat: " + (d.niat || "-") + ". Balas JSON: {\"top\":[\"..\",\"..\",\"..\"],\"blok\":[{\"jam\":\"07:00\",\"teks\":\"..\"}]}", json: true, temp: 0.8
        });
        UI.clear(box);
        if (out && out.top) {
          box.appendChild(UI.el("div", { class: "kick", text: "Usulan 3 prioritas" }));
          out.top.forEach(function (x) { box.appendChild(UI.el("div", { class: "sub-item" }, [UI.icon("point"), UI.el("span", { text: x })])); });
          box.appendChild(UI.el("div", { class: "kick", style: "margin-top:14px", text: "Usulan blok waktu" }));
          (out.blok || []).forEach(function (x) { box.appendChild(UI.el("div", { class: "sub-item" }, [UI.el("b", { text: x.jam || "" }), UI.el("span", { text: " " + (x.teks || "") })])); });
          box.appendChild(UI.el("button", { class: "btn btn-primary", style: "margin-top:14px", onclick: function () { d.top = (out.top || []).slice(0, 3).map(function (x) { return { t: x, done: false }; }); d.blok = (out.blok || []).map(function (x) { return { jam: x.jam || "", teks: x.teks || "", done: false }; }); save(d); m.close(); render(); UI.toast("Rencana diterapkan", "ok"); } }, [UI.icon("check"), "Terapkan ke hari ini"]));
        } else box.appendChild(UI.el("div", { class: "ai-out", text: typeof out === "string" ? out : JSON.stringify(out) }));
      } catch (e) { UI.clear(box); box.appendChild(UI.el("div", { class: "empty", text: e.message })); }
    }

    render();
  }
});
