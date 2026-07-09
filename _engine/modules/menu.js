/* menu.js — SIGNATURE Nara: perencana menu keluarga mingguan (7 hari × 3 waktu)
   + daftar belanja otomatis. Data: sig_meals { iso: {pagi,siang,malam} }. */
(window.SIG_SEEDERS = window.SIG_SEEDERS || []).push(function (S, spec, u) {
  if (spec.kind !== "mom") return;
  var meals = {}, contoh = [
    { pagi: "Nasi goreng + telur", siang: "Ayam bakar + sayur", malam: "Sup ayam" },
    { pagi: "Roti + susu", siang: "Ikan goreng + tumis kangkung", malam: "Capcay" },
    { pagi: "Bubur ayam", siang: "Rendang + urap", malam: "Mie kuah" }
  ];
  for (var k = 0; k < 3; k++) { meals[u.iso(u.shift(k))] = contoh[k]; }
  S.set("sig_meals", meals);
});
window.Shell.register({
  id: "menu", nama: "Menu Keluarga", icon: "chef-hat",
  mount: function (root, ctx) {
    var UI = ctx.ui, S = ctx.store;
    var offset = 0; // minggu ke depan/belakang
    var WAKTU = [["pagi", "🌅 Sarapan"], ["siang", "☀️ Makan Siang"], ["malam", "🌙 Makan Malam"]];
    function meals() { return S.get("sig_meals", {}); }
    function weekDays() { var out = [], base = new Date(); base.setHours(0, 0, 0, 0); var dow = (base.getDay() + 6) % 7; base.setDate(base.getDate() - dow + offset * 7); for (var i = 0; i < 7; i++) { var d = new Date(base); d.setDate(base.getDate() + i); out.push(d); } return out; }

    function render() {
      UI.clear(root);
      var days = weekDays();
      root.appendChild(UI.el("div", { class: "view-head" }, [
        UI.el("div", {}, [UI.el("div", { class: "kick", text: "Keluarga" }), UI.el("h1", { class: "h1", text: "Menu Mingguan" })]),
        UI.el("div", { class: "row gap8" }, [
          UI.el("button", { class: "btn btn-ghost btn-icon", onclick: function () { offset--; render(); } }, [UI.icon("chevron-left")]),
          UI.el("button", { class: "btn btn-ghost btn-sm", onclick: function () { offset = 0; render(); } }, ["Minggu ini"]),
          UI.el("button", { class: "btn btn-ghost btn-icon", onclick: function () { offset++; render(); } }, [UI.icon("chevron-right")]),
          UI.el("button", { class: "btn btn-primary btn-sm", onclick: belanja }, [UI.icon("shopping-cart"), "Daftar Belanja"])
        ])
      ]));
      root.appendChild(UI.el("div", { class: "hint", style: "margin-top:-14px;margin-bottom:16px", text: UI.fmtDate(days[0]) + " – " + UI.fmtDate(days[6], true) }));
      var m = meals();
      var wrap = UI.el("div", { class: "menu-grid" });
      days.forEach(function (d) {
        var iso = d.toISOString().slice(0, 10), day = m[iso] || {};
        var isToday = iso === UI.todayISO();
        var card = UI.el("div", { class: "menu-day" + (isToday ? " today" : "") });
        card.appendChild(UI.el("div", { class: "menu-day-h" }, [UI.el("b", { text: UI.HARI[d.getDay()] }), UI.el("span", { class: "hint", style: "margin:0", text: d.getDate() + "/" + (d.getMonth() + 1) })]));
        WAKTU.forEach(function (w) {
          var inp = UI.input({ val: day[w[0]] || "", ph: w[1] });
          inp.addEventListener("change", function () { var mm = meals(); mm[iso] = mm[iso] || {}; mm[iso][w[0]] = inp.value; S.set("sig_meals", mm); });
          card.appendChild(UI.el("div", { class: "menu-slot" }, [UI.el("span", { class: "menu-w", text: w[1] }), inp]));
        });
        wrap.appendChild(card);
      });
      root.appendChild(wrap);
    }
    function belanja() {
      var days = weekDays(), m = meals(), items = {};
      days.forEach(function (d) { var day = m[d.toISOString().slice(0, 10)] || {}; ["pagi", "siang", "malam"].forEach(function (w) { if (day[w]) { day[w].split(/[,+]/).forEach(function (it) { it = it.trim(); if (it) items[it.toLowerCase()] = it; }); } }); });
      var list = Object.keys(items);
      var body = UI.el("div", {});
      if (!list.length) body.appendChild(UI.el("div", { class: "hint", text: "Isi menu dulu untuk membuat daftar belanja otomatis." }));
      else { body.appendChild(UI.el("p", { class: "hint", text: "Bahan dari menu minggu ini (" + list.length + " item):" })); list.forEach(function (it) { body.appendChild(UI.el("div", { class: "ps-check", style: "padding:5px 0" }, [UI.el("span", { class: "hcheck", style: "width:20px;height:20px;border-radius:6px;pointer-events:none" }), UI.el("span", { text: items[it] })])); }); body.appendChild(UI.el("button", { class: "btn btn-ghost btn-sm", style: "margin-top:12px", onclick: function () { list.forEach(function (it) { S.push("tasks", { id: uid(), teks: "Beli: " + items[it], prioritas: "sedang", tenggat: "", done: false, t: Date.now() }); }); UI.toast(list.length + " item → Checklist › Tugas", "ok"); } }, [UI.icon("plus"), "Kirim ke Tugas"])); }
      UI.modal("Daftar Belanja", body, { wide: true });
    }
    render();
  }
});
