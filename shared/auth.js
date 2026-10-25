// Accesso con email e password tramite Supabase Auth.
// Richiede, prima di questo file: la libreria supabase-js e shared/config.js.
(function () {
  const C = window.SITE_CONFIG;
  const sb = C.configured
    ? window.supabase.createClient(C.supabaseUrl, C.supabaseAnonKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      })
    : null;
  window.sb = sb;

  function homeUrl() { return C.root; }

  // Accetta come destinazione solo percorsi interni al sito.
  function safeNext(n) {
    if (!n) return null;
    try {
      const u = new URL(n, location.origin);
      if (u.origin !== location.origin) return null;
      if (!u.href.startsWith(C.root)) return null;
      return u.href;
    } catch (e) { return null; }
  }

  async function currentUser() {
    if (!sb) return null;
    const { data } = await sb.auth.getSession();
    return data.session ? data.session.user : null;
  }

  // Da usare nei siti: se non c'è accesso, rimanda alla homepage e poi torna qui.
  async function requireUser() {
    const u = await currentUser();
    if (!u) {
      location.replace(homeUrl() + "?next=" + encodeURIComponent(location.href));
      await new Promise(() => {}); // si ferma qui mentre la pagina cambia
    }
    return u;
  }

  function italianError(err) {
    const m = (err && (err.message || err.error_description || String(err))) || "";
    if (/Invalid login credentials/i.test(m)) return "Email o password non corretti.";
    if (/Email not confirmed/i.test(m)) return "Devi prima confermare l'indirizzo email: controlla la posta (anche lo spam).";
    if (/User already registered/i.test(m)) return "Esiste già un account con questa email. Accedi oppure reimposta la password.";
    if (/Password should be at least/i.test(m)) return "La password è troppo corta: usa almeno 8 caratteri.";
    if (/Signups not allowed/i.test(m)) return "Le nuove registrazioni sono disattivate. Chiedi all'amministratore di crearti l'account.";
    if (/rate limit/i.test(m)) return "Troppi tentativi in poco tempo. Riprova tra qualche minuto.";
    if (/Failed to fetch|NetworkError/i.test(m)) return "Nessuna connessione con il server. Controlla internet e riprova.";
    return m || "Si è verificato un errore. Riprova.";
  }

  window.Auth = {
    sb, homeUrl, safeNext, currentUser, requireUser, italianError,
    signIn: (email, password) => sb.auth.signInWithPassword({ email, password }),
    signUp: (email, password) => sb.auth.signUp({ email, password, options: { emailRedirectTo: homeUrl() } }),
    resetPassword: (email) => sb.auth.resetPasswordForEmail(email, { redirectTo: homeUrl() }),
    updatePassword: (password) => sb.auth.updateUser({ password }),
    signOut: async () => { await sb.auth.signOut(); location.href = homeUrl(); }
  };
})();
