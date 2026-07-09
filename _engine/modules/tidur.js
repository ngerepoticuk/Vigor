/* tidur.js — SIGNATURE Vita: log tidur (jam tidur→bangun, kualitas) + durasi
   otomatis + tren + rata-rata + tips. Data: sig_sleep [{id,iso,tidur,bangun,kualitas}]. */
(window.SIG_SEEDERS = window.SIG_SEEDERS || []).push(function (S, spec, u) {
  if (spec.kind !== "wellness") return;
  var arr = [], t = ["23:30", "22:45", "00:15", "23:00", "22:30", "23:45", "22:15"], b = ["06:30", "06:00", "07:00", "05:45", "06:00", "07:15", "05:30"], k = [3, 4, 2, 4, 5, 3, 4];
  for (var i = 6; i >= 0; i--) { arr.push({ id: u.id() + i, iso: u.iso(u.shift(-i)), tidur: t[i], bangun: b[i], kualitas: k[i] }); }
  S.set("sig_sleep", arr);
});
window.Shell.register({
  id: "tidur", nama: "Siklus Tidur", icon: "zzz",
  mount: function (root, ctx) {
    var UI = ctx.ui, S = ctx.store;
    function all() { return S.get("sig_sleep", []).slice().sort(function (a, b) { return a.iso < b.iso ? -1 : 1; }); }
    function durasi(x) {
      var t = x.tidur.split(":"), b = x.bangun.split(":");
      var m = (+b[0] * 60 + +b[1]) - (+t[0] * 60 + +t[1]); if (m <= 0) m += 1440;
      return m / 60;
    }

    function render() {
      UI.clear(root);
      var arr = all();
      root.appendChild(UI.viewHead("Siklus Tidur", "Kesejahteraan", UI.el("button", { class: "btn btn-primary", onclick: function () { edit(null); } }, [UI.icon("plus"), "Catat Tidur"])));
      if (!arr.length) { root.appendChild(UI.empty("Belum ada catatan tidur.<br>Tidur adalah fondasi mood & energi. Catat jam tidur-bangunmu — polanya akan bicara.", UI.el("button", { class: "btn btn-primary", onclick: function () { edit(null); } }, [UI.icon("plus"), "Catat semalam"]))); return; }
      var last7 = arr.slice(-7);
      var avgDur = last7.reduce(function (a, x) { return a + durasi(x); }, 0) / last7.length;
      var avgK = last7.reduce(function (a, x) { return a + (x.kualitas || 3); }, 0) / last7.length;
      var konsisten = last7.filter(function (x) { return durasi(x) >= 7; }).length;
      root.appendChild(UI.el("div", { class: "cards", style: "margin-bottom:18px" }, [
        UI.statCard({ label: "Rata-rata (7h)", value: avgDur.toFixed(1) + " jam", icon: "zzz", color: avgDur >= 7 ? "var(--ok)" : "var(--warn)" }),
        UI.statCard({ label: "Kualitas", value: avgK.toFixed(1) + "/5", icon: "star" }),
        UI.statCard({ label: "Malam ≥7 jam", value: konsisten + "/7", icon: "moon" })
      ]));
      root.appendChild(UI.el("div", { class: "panel", style: "margin-bottom:18px" }, [
        UI.el("div", { class: "panel-t", text: "Durasi Tidur 7 Malam" }),
        UI.el("div", { style: "height:130px;margin-top:14px" }, [UI.bars(last7.map(function (x) { return { label: UI.HARIS[new Date(x.iso).getDay()], val: +durasi(x).toFixed(1), dim: durasi(x) < 7 }; }), { h: 130 })]),
        UI.el("div", { class: "hint", style: "margin-top:8px", text: "Target sehat: 7–9 jam. Batang redup = kurang dari 7 jam." })
      ]));
      if (avgDur < 6.5) root.appendChild(UI.briefing("Rata-rata tidurmu <b>" + avgDur.toFixed(1) + " jam</b> — di bawah kebutuhan. Coba majukan jam tidur 30 menit malam ini, dan hindari layar 30 menit sebelumnya. Perubahan kecil, efek besar ke mood & energimu.", { title: "Perhatian Lembut", icon: "moon" }));
      var tbl = UI.el("table", { class: "tbl" }, [UI.el("tr", {}, [UI.el("th", { text: "Malam" }), UI.el("th", { text: "Tidur" }), UI.el("th", { text: "Bangun" }), UI.el("th", { class: "num", text: "Durasi" }), UI.el("th", { text: "Kualitas" }), UI.el("th", {})])]);
      arr.slice().reverse().slice(0, 10).forEach(function (x) {
        tbl.appendChild(UI.el("tr", {}, [
          UI.el("td", { text: UI.fmtDate(x.iso, true) }), UI.el("td", { class: "mono", text: x.tidur }), UI.el("td", { class: "mono", text: x.bangun }),
          UI.el("td", { class: "num", text: durasi(x).toFixed(1) + " jam" }),
          UI.el("td", { text: "★".repeat(x.kualitas || 3) }),
          UI.el("td", { class: "num" }, [UI.el("button", { class: "btn btn-ghost btn-icon", onclick: function () { edit(x); } }, [UI.icon("dots")])])
        ]));
      });
      root.appendChild(UI.el("div", { class: "panel", style: "padding:6px 10px" }, [tbl]));
    }
    function edit(x) {
      var isNew = !x; x = x || { id: uid(), iso: UI.todayISO(), tidur: "22:30", bangun: "05:30", kualitas: 4 };
      var tgl = UI.input({ type: "date", val: x.iso });
      var jt = UI.el("input", { class: "input", type: "time", value: x.tidur });
      var jb = UI.el("input", { class: "input", type: "time", value: x.bangun });
      var k = UI.el("input", { type: "range", min: 1, max: 5, value: x.kualitas });
      var kl = UI.el("span", { class: "hint", style: "margin:0", text: "Kualitas: " + x.kualitas + "/5" });
      k.addEventListener("input", function () { kl.textContent = "Kualitas: " + k.value + "/5"; });
      var body = UI.el("div", {}, [UI.field("Malam tanggal", tgl), UI.el("div", { class: "grid2" }, [UI.el("label", { class: "fld" }, [UI.el("span", { text: "Jam tidur" }), jt]), UI.el("label", { class: "fld" }, [UI.el("span", { text: "Jam bangun" }), jb])]), UI.el("label", { class: "fld" }, [kl, k])]);
      var save = UI.el("button", { class: "btn btn-primary", text: isNew ? "Catat" : "Simpan" });
      var del = isNew ? null : UI.el("button", { class: "btn btn-danger", text: "Hapus" });
      body.appendChild(UI.el("div", { class: "row", style: "justify-content:space-between;margin-top:6px" }, [del || UI.el("span"), save]));
      var m = UI.modal(isNew ? "Catat Tidur" : "Edit Catatan", body);
      save.addEventListener("click", function () { x.iso = tgl.value; x.tidur = jt.value; x.bangun = jb.value; x.kualitas = +k.value; var arr = S.get("sig_sleep", []); var i = arr.map(function (y) { return y.id; }).indexOf(x.id); if (i >= 0) arr[i] = x; else arr.push(x); S.set("sig_sleep", arr); m.close(); render(); UI.toast("Tidur nyenyak 😴", "ok"); });
      if (del) del.addEventListener("click", function () { m.close(); UI.confirm("Hapus catatan?", "", function () { S.remove("sig_sleep", x.id); render(); }, { danger: true }); });
    }
    render();
  }
});
