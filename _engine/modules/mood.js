/* mood.js — SIGNATURE Vita: log harian mood + jam tidur + energi + stres,
   tren mingguan & insight korelasi tidur↔mood. Data: sig_wellness [{iso,mood,tidur,energi,stres}]. */
(window.SIG_SEEDERS = window.SIG_SEEDERS || []).push(function (S, spec, u) {
  if (spec.kind !== "wellness") return;
  var arr = [], moods = [4, 5, 3, 4, 5, 4, 3, 4, 5, 4, 4, 3, 5, 4], tidur = [7, 8, 5.5, 7, 8, 6, 5, 7.5, 8, 7, 6.5, 5.5, 8, 7];
  for (var k = 13; k >= 0; k--) { arr.push({ id: u.id() + k, iso: u.iso(u.shift(-k)), mood: moods[k], tidur: tidur[k], energi: Math.max(1, Math.min(5, Math.round(tidur[k] / 2))), stres: 6 - moods[k] }); }
  S.set("sig_wellness", arr);
});
window.Shell.register({
  id: "mood", nama: "Jurnal Diri", icon: "mood-smile",
  mount: function (root, ctx) {
    var UI = ctx.ui, S = ctx.store;
    var EMO = ["", "😔", "😕", "😐", "🙂", "😄"];
    function log() { return S.get("sig_wellness", []); }
    function today() { return log().filter(function (x) { return x.iso === UI.todayISO(); })[0]; }

    function render() {
      UI.clear(root);
      var arr = log().slice().sort(function (a, b) { return a.iso < b.iso ? -1 : 1; });
      root.appendChild(UI.viewHead("Jurnal Diri", "Kesejahteraan", UI.el("button", { class: "btn btn-primary", onclick: function () { checkin(today()); } }, [UI.icon(today() ? "edit" : "plus"), today() ? "Perbarui hari ini" : "Check-in hari ini"])));

      if (!arr.length) { root.appendChild(UI.empty("Belum ada check-in.<br>Catat mood, tidur & energimu tiap hari — pola yang memengaruhi harimu akan terlihat.", UI.el("button", { class: "btn btn-primary", onclick: function () { checkin(null); } }, [UI.icon("plus"), "Check-in pertama"]))); return; }
      var last14 = arr.slice(-14);
      var avgMood = avg(last14.map(function (x) { return x.mood; })), avgTidur = avg(last14.map(function (x) { return x.tidur; })), avgEn = avg(last14.map(function (x) { return x.energi; }));
      root.appendChild(UI.el("div", { class: "cards", style: "margin-bottom:18px" }, [
        UI.statCard({ label: "Mood rata-rata", value: avgMood.toFixed(1) + " " + EMO[Math.round(avgMood)], icon: "mood-smile" }),
        UI.statCard({ label: "Tidur rata-rata", value: avgTidur.toFixed(1) + " jam", icon: "moon" }),
        UI.statCard({ label: "Energi", value: avgEn.toFixed(1) + "/5", icon: "battery-charging" }),
        UI.statCard({ label: "Check-in", value: arr.length, icon: "calendar-stats" })
      ]));
      // tren mood 14 hari
      root.appendChild(UI.el("div", { class: "split" }, [
        UI.el("div", { class: "panel" }, [UI.el("div", { class: "panel-t", text: "Tren Mood (14 hari)" }), UI.el("div", { style: "height:120px;margin-top:14px" }, [UI.bars(last14.map(function (x) { return { label: new Date(x.iso).getDate() + "", val: x.mood }; }), { h: 120 })])]),
        UI.el("div", { class: "panel" }, [UI.el("div", { class: "panel-t", text: "Tidur vs Energi" }), UI.el("div", { style: "margin-top:14px" }, [UI.barsH(last14.slice(-6).map(function (x) { return { label: UI.fmtDate(x.iso), val: x.tidur, max: 10, note: x.tidur + " jam" }; }))])])
      ]));
      // insight korelasi
      var goodSleep = last14.filter(function (x) { return x.tidur >= 7; }), badSleep = last14.filter(function (x) { return x.tidur < 6; });
      if (goodSleep.length >= 2 && badSleep.length >= 2) {
        var mg = avg(goodSleep.map(function (x) { return x.mood; })), mb = avg(badSleep.map(function (x) { return x.mood; }));
        if (mg - mb >= 0.5) root.appendChild(UI.briefing("Saat tidurmu <b>≥7 jam</b>, mood rata-rata <span class='hl'>" + mg.toFixed(1) + "</span> — vs <span class='hl'>" + mb.toFixed(1) + "</span> saat tidur &lt;6 jam. Tidur cukup terbukti jadi pengungkit mood-mu. Jadikan prioritas.", { title: "Pola yang terlihat", icon: "bulb" }));
      }
    }
    function avg(a) { return a.length ? a.reduce(function (x, y) { return x + y; }, 0) / a.length : 0; }

    function checkin(x) {
      var isNew = !x; x = x || { id: uid(), iso: UI.todayISO(), mood: 4, tidur: 7, energi: 3, stres: 2 };
      var moodSel = UI.el("div", { class: "mood-pick" });
      [1, 2, 3, 4, 5].forEach(function (v) { var b = UI.el("button", { class: "mood-opt" + (x.mood === v ? " on" : ""), text: EMO[v], onclick: function () { x.mood = v; Array.prototype.forEach.call(moodSel.children, function (c) { c.classList.remove("on"); }); b.classList.add("on"); } }); moodSel.appendChild(b); });
      var tidur = UI.el("input", { class: "input", type: "number", step: "0.5", value: x.tidur, placeholder: "7" });
      var energi = UI.el("input", { type: "range", min: 1, max: 5, value: x.energi });
      var enLbl = UI.el("span", { class: "hint", style: "margin:0", text: "Energi: " + x.energi + "/5" });
      energi.addEventListener("input", function () { enLbl.textContent = "Energi: " + energi.value + "/5"; });
      var cat = UI.textarea({ val: x.catatan, ph: "Ada yang ingin dicatat? (opsional)", rows: 2 });
      var body = UI.el("div", {}, [
        UI.el("label", { class: "fld" }, [UI.el("span", { text: "Bagaimana perasaanmu?" }), moodSel]),
        UI.field("Jam tidur semalam", tidur),
        UI.el("label", { class: "fld" }, [enLbl, energi]),
        UI.field("Catatan", cat)
      ]);
      var save = UI.el("button", { class: "btn btn-primary", text: "Simpan check-in" }); body.appendChild(UI.el("div", { class: "row", style: "justify-content:flex-end;margin-top:6px" }, [save]));
      var m = UI.modal("Check-in Harian", body);
      save.addEventListener("click", function () {
        x.tidur = +tidur.value || 0; x.energi = +energi.value; x.catatan = cat.value.trim();
        var arr = log(); var i = arr.map(function (y) { return y.iso; }).indexOf(x.iso);
        if (i >= 0) arr[i] = x; else arr.push(x); S.set("sig_wellness", arr);
        m.close(); render(); UI.toast("Tercatat — jaga dirimu ✨", "ok");
      });
    }
    render();
  }
});
