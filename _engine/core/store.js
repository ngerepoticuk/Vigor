/* store.js — localStorage ber-namespace per produk. Versioned, aman file://. */
window.Store = (function () {
  var ns = (window.APP && APP.id) || "planner";
  function k(key) { return ns + ":" + key; }
  return {
    get: function (key, def) {
      try {
        var v = localStorage.getItem(k(key));
        return v == null ? (def === undefined ? null : def) : JSON.parse(v);
      } catch (e) { return def === undefined ? null : def; }
    },
    set: function (key, val) {
      try { localStorage.setItem(k(key), JSON.stringify(val)); return true; }
      catch (e) { return false; }
    },
    del: function (key) { try { localStorage.removeItem(k(key)); } catch (e) {} },
    push: function (key, item) {
      var arr = this.get(key, []); if (!Array.isArray(arr)) arr = [];
      arr.push(item); this.set(key, arr); return arr;
    },
    update: function (key, id, patch) {
      var arr = this.get(key, []); if (!Array.isArray(arr)) return null;
      for (var i = 0; i < arr.length; i++) if (arr[i].id === id) { Object.assign(arr[i], patch); this.set(key, arr); return arr[i]; }
      return null;
    },
    remove: function (key, id) {
      var arr = this.get(key, []); if (!Array.isArray(arr)) return;
      this.set(key, arr.filter(function (x) { return x.id !== id; }));
    },
    keys: function () { var out = []; for (var i = 0; i < localStorage.length; i++) { var kk = localStorage.key(i); if (kk && kk.indexOf(ns + ":") === 0) out.push(kk); } return out; },
    clearAll: function () { this.keys().forEach(function (kk) { try { localStorage.removeItem(kk); } catch (e) {} }); }
  };
})();

/* util id + tanggal ringkas dipakai lintas modul */
window.uid = function () { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); };
