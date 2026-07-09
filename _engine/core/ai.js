/* ai.js — lapisan AI BYOK (1 pintu). Default Gemini (ramah browser/CORS,
   key gratis dari Google AI Studio). Modul panggil AI.ask(), tak sentuh API. */
window.AI = (function () {
  function key() { return Store.get("apikey", ""); }
  function model() { return (APP.ai && APP.ai.model) || "gemini-2.0-flash"; }

  async function gemini(k, o) {
    var url = "https://generativelanguage.googleapis.com/v1beta/models/" +
      model() + ":generateContent?key=" + encodeURIComponent(k);
    var body = { contents: [{ role: "user", parts: [{ text: o.prompt || "" }] }] };
    if (o.system) body.systemInstruction = { parts: [{ text: o.system }] };
    body.generationConfig = { temperature: o.temp == null ? 0.8 : o.temp };
    if (o.json) body.generationConfig.responseMimeType = "application/json";
    var r = await fetch(url, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!r.ok) {
      var t = await r.text(); var msg = "AI error " + r.status;
      try { msg = JSON.parse(t).error.message || msg; } catch (e) {}
      throw new Error(msg);
    }
    var d = await r.json();
    var parts = (((d.candidates || [])[0] || {}).content || {}).parts;
    var txt = parts && parts[0] ? parts[0].text : "";
    if (o.json) { try { return JSON.parse(txt); } catch (e) { return txt; } }
    return txt;
  }

  async function ask(o) {
    o = o || {};
    var k = key();
    if (!k) { var e = new Error("Belum ada API key. Buka Pengaturan."); e.code = "NO_KEY"; throw e; }
    return gemini(k, o);
  }
  return { ask: ask, hasKey: function () { return !!key(); } };
})();
