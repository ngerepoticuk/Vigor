/* brain.js — LIFE BRAIN: profil pribadi + nilai + gaya coach.
   Diisi sekali, dipakai SEMUA modul lewat ctx.brain sebagai konteks AI.
   Inti "moat": app kenal siapa kamu, jadi saran AI tidak mulai dari nol. */
window.Brain = (function () {
  var DEF = {
    diri: { nama: "", peran: "", musim: "", umur: "" },   // peran=role hidup; musim=tema tahun ini
    nilai: [],                                            // core values
    fokus: "",                                            // satu fokus utama saat ini
    tantangan: "",                                        // hambatan terbesar
    voice: { panggil: "kamu", nada: "hangat & jujur" },   // gaya coach AI
    riwayat: [],
    meta: {}
  };
  function get() {
    var b = Store.get("brain", null);
    if (!b) return JSON.parse(JSON.stringify(DEF));
    b.diri = b.diri || {}; b.voice = b.voice || {}; b.nilai = b.nilai || []; b.riwayat = b.riwayat || [];
    return b;
  }
  function set(b) { b.meta = b.meta || {}; b.meta.diupdate = Date.now(); Store.set("brain", b); }
  function isSet() { var b = get(); return !!(b.diri && b.diri.nama); }
  function summary() {
    var b = get();
    if (!b.diri.nama) return "";
    return b.diri.nama + (b.diri.musim ? " · " + b.diri.musim : (b.diri.peran ? " · " + b.diri.peran : ""));
  }
  function context() {
    var b = get();
    return [
      "Profil pemilik planner (untuk personalisasi coaching AI):",
      "- Nama: " + (b.diri.nama || "-"),
      "- Peran/identitas: " + (b.diri.peran || "-"),
      "- Tema/musim hidup sekarang: " + (b.diri.musim || "-"),
      "- Nilai inti: " + ((b.nilai || []).join(", ") || "-"),
      "- Fokus utama saat ini: " + (b.fokus || "-"),
      "- Tantangan terbesar: " + (b.tantangan || "-"),
      'Gaya coach: nada ' + (b.voice.nada || "hangat") + ', panggil pengguna "' + (b.voice.panggil || "kamu") + '".'
    ].join("\n");
  }
  function logResult(entry) {
    var b = get(); b.riwayat.unshift(Object.assign({ t: Date.now() }, entry));
    b.riwayat = b.riwayat.slice(0, 60); set(b);
  }
  return { get: get, set: set, isSet: isSet, summary: summary, context: context, logResult: logResult };
})();
