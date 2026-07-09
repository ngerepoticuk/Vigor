/* coach.js — Chat Coach melayang: tanya apa saja, AI jawab berbasis data
   planner (skor, streak, sasaran, jurnal, modul khas). Riwayat di __chat. */
window.Coach = (function () {
  var open = false, panel, listEl, inputEl;

  function dataContext() {
    try {
      var o = PIntel.overview(), parts = [];
      parts.push("Ringkasan planner pengguna hari ini:");
      parts.push("- " + (APP.spec.scoreLabel || "Skor") + ": " + o.life.score + "/100 (konsistensi " + o.consistency + "%, streak terbaik " + o.bestStreak + " hari, momentum " + o.momentum.now + "%)");
      parts.push("- Kebiasaan hari ini: " + o.doneToday + "/" + o.habitCount + " selesai");
      var goals = Store.get("goals", []).filter(function (g) { return g.status === "aktif"; }).slice(0, 4);
      if (goals.length) parts.push("- Sasaran aktif: " + goals.map(function (g) { return g.judul + " (" + (g.progress || 0) + "%)"; }).join("; "));
      var tasks = Store.get("tasks", []).filter(function (t) { return !t.done; }).slice(0, 5);
      if (tasks.length) parts.push("- Tugas belum selesai: " + tasks.map(function (t) { return t.teks; }).join("; "));
      var j = Store.get("journal", []).slice(0, 2);
      if (j.length) parts.push("- Jurnal terakhir (mood " + j[0].mood + "/5): " + (j[0].teks || "").slice(0, 120));
      if (o.avgMood != null) parts.push("- Mood rata-rata 14 hari: " + o.avgMood + "/5");
      return parts.join("\n");
    } catch (e) { return ""; }
  }

  function hist() { return Store.get("__chat", []); }
  function pushHist(role, text) { var h = hist(); h.push({ r: role, t: text }); Store.set("__chat", h.slice(-24)); }

  function bubble(role, text) {
    return UI.el("div", { class: "coach-msg " + role }, [UI.el("div", { class: "coach-bubble", text: text })]);
  }
  function renderHist() {
    UI.clear(listEl);
    var h = hist();
    if (!h.length) listEl.appendChild(UI.el("div", { class: "coach-hello" }, [
      UI.icon("sparkles"),
      UI.el("p", { html: "Halo! Aku coach-mu di <b>" + APP.nama + "</b>. Aku bisa lihat skor, kebiasaan & sasaranmu — tanya apa saja:<br><i>\"gimana mingguku?\" · \"bantu susun besok\" · \"kenapa skorku turun?\"</i>" })
    ]));
    h.forEach(function (m) { listEl.appendChild(bubble(m.r, m.t)); });
    listEl.scrollTop = listEl.scrollHeight;
  }

  async function send() {
    var q = inputEl.value.trim(); if (!q) return;
    if (!AI.hasKey()) { UI.toast("Isi API key dulu di Pengaturan", "err"); Shell.openSettings(); return; }
    inputEl.value = "";
    pushHist("user", q); renderHist();
    var thinking = UI.el("div", { class: "coach-msg ai" }, [UI.el("div", { class: "coach-bubble typing", text: "…" })]);
    listEl.appendChild(thinking); listEl.scrollTop = listEl.scrollHeight;
    try {
      var convo = hist().slice(-10).map(function (m) { return (m.r === "user" ? "Pengguna" : "Coach") + ": " + m.t; }).join("\n");
      var out = await AI.ask({
        system: Brain.context() + "\nKamu coach pribadi di aplikasi planner \"" + APP.nama + "\" (" + (APP.spec.kindLabel || "") + "). Jawab hangat, jujur, ringkas (maks 5 kalimat), actionable, bahasa Indonesia santai. Gunakan data planner bila relevan.\n\n" + dataContext(),
        prompt: convo + "\nPengguna: " + q + "\nCoach:",
        temp: 0.8
      });
      thinking.remove();
      pushHist("ai", out); renderHist();
    } catch (e) { thinking.remove(); pushHist("ai", "Maaf, ada kendala: " + e.message); renderHist(); }
  }

  function build() {
    listEl = UI.el("div", { class: "coach-list" });
    inputEl = UI.el("input", { class: "coach-input", placeholder: "Tanya coach-mu…" });
    inputEl.addEventListener("keydown", function (e) { if (e.key === "Enter") send(); });
    panel = UI.el("div", { class: "coach-panel" }, [
      UI.el("div", { class: "coach-head" }, [
        UI.el("div", { class: "flex center gap8" }, [UI.el("span", { class: "coach-dot" }), UI.el("b", { text: "Coach " + APP.nama })]),
        UI.el("div", { class: "row gap8" }, [
          UI.el("button", { class: "coach-hbtn", title: "Bersihkan", onclick: function () { Store.set("__chat", []); renderHist(); } }, [UI.icon("eraser")]),
          UI.el("button", { class: "coach-hbtn", title: "Tutup", onclick: function () { toggle(false); } }, [UI.icon("x")])
        ])
      ]),
      listEl,
      UI.el("div", { class: "coach-foot" }, [inputEl, UI.el("button", { class: "btn btn-primary btn-icon", onclick: send }, [UI.icon("send")])])
    ]);
    document.body.appendChild(panel);
  }

  function toggle(force) {
    open = force != null ? force : !open;
    panel.classList.toggle("show", open);
    if (open) { renderHist(); setTimeout(function () { inputEl.focus(); }, 80); }
  }

  function init() {
    build();
    var btn = UI.el("button", { class: "coach-fab", title: "Chat coach AI", onclick: function () { toggle(); } }, [UI.icon("message-chatbot")]);
    document.body.appendChild(btn);
  }
  return { init: init, toggle: toggle };
})();
