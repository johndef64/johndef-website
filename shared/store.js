// Archivio dati condiviso da tutti i siti.
// Ogni sito salva coppie chiave → valore (qualsiasi dato JSON) per l'utente collegato.
// - get(chiave, predefinito): lettura immediata dalla copia in memoria
// - set(chiave, valore): salva subito in locale e, dopo 400 ms, nel database
// - onChange(fn): fn(chiave, valore) quando lo stesso utente modifica il dato da un altro dispositivo
// - onStatus(fn): fn("sincronizzato" | "salvataggio" | "offline" | "errore")
// Richiede shared/auth.js.
(function () {
  let app = null, uid = null, sb = null, channel = null;
  const cache = {}, timers = {}, pending = {}, changeFns = [], statusFns = [];
  let status = "sincronizzato";

  const lsKey = (k) => `as:${uid}:${app}:${k}`;
  function saveLocal(k, v) { try { localStorage.setItem(lsKey(k), JSON.stringify(v)); } catch (e) {} }
  function loadLocal() {
    try {
      const p = `as:${uid}:${app}:`;
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(p)) cache[k.slice(p.length)] = JSON.parse(localStorage.getItem(k));
      }
    } catch (e) {}
  }
  function setStatus(s) { status = s; statusFns.forEach((f) => { try { f(s); } catch (e) {} }); }
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

  async function flush(k) {
    const { error } = await sb.from("app_data").upsert(
      { user_id: uid, app, key: k, value: cache[k], updated_at: new Date().toISOString() },
      { onConflict: "user_id,app,key" }
    );
    pending[k] = false;
    if (error) { pending[k] = "retry"; setStatus(navigator.onLine ? "errore" : "offline"); }
    else if (!Object.values(pending).some(Boolean)) setStatus("sincronizzato");
  }

  async function init(appId) {
    app = appId;
    sb = window.Auth.sb;
    const user = await window.Auth.requireUser();
    uid = user.id;
    loadLocal();

    const { data, error } = await sb.from("app_data").select("key,value").eq("app", app);
    if (error) setStatus("offline");
    else data.forEach((r) => { cache[r.key] = r.value; saveLocal(r.key, r.value); });

    channel = sb
      .channel(`app_data:${app}:${uid}`)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "app_data", filter: `user_id=eq.${uid}` },
        (p) => {
          const r = p.new;
          if (!r || r.app !== app || pending[r.key]) return;
          if (same(cache[r.key], r.value)) return;
          cache[r.key] = r.value; saveLocal(r.key, r.value);
          changeFns.forEach((f) => { try { f(r.key, r.value); } catch (e) { console.error(e); } });
        })
      .subscribe();

    // Ritenta i salvataggi falliti quando torna la connessione.
    window.addEventListener("online", () => {
      Object.keys(pending).filter((k) => pending[k] === "retry").forEach((k) => { pending[k] = true; setStatus("salvataggio"); flush(k); });
    });
    return user;
  }

  window.AppStore = {
    init,
    get: (k, d) => (k in cache ? cache[k] : d),
    set(k, v) {
      cache[k] = v; saveLocal(k, v);
      pending[k] = true; setStatus("salvataggio");
      clearTimeout(timers[k]);
      timers[k] = setTimeout(() => flush(k), 400);
    },
    all: () => ({ ...cache }),
    onChange: (f) => changeFns.push(f),
    onStatus: (f) => { statusFns.push(f); f(status); }
  };
})();
