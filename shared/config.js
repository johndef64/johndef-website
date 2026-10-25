// ============================================================
// CONFIGURAZIONE — l'unico file da modificare dopo aver creato
// il progetto Supabase (vedi README, passo 2).
// Supabase → Project Settings → API (o "Data API" / "API Keys").
// La chiave "anon" / "publishable" è pubblica per progetto: i dati
// restano protetti dalle regole di sicurezza in supabase/schema.sql.
// NON inserire mai qui la chiave "service_role" / "secret".
// ============================================================
window.SITE_CONFIG = {
  supabaseUrl: "https://yrivxohegtbwrltttcjb.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyaXZ4b2hlZ3Rid3JsdHR0Y2piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI5Mjc2NzAsImV4cCI6MjEwODUwMzY3MH0.thEeD_PqK0sk-nSeZvL75ZurAQLLwiLZBSwdQ_YgxSU",
  siteName: "I miei siti"
};

// Indirizzo della radice del repository, calcolato da dove si trova questo file.
// Funziona sia su GitHub Pages (https://utente.github.io/repo/) sia in locale.
window.SITE_CONFIG.root = new URL("../", document.currentScript.src).href;
window.SITE_CONFIG.configured =
  !/TUO-PROGETTO|INCOLLA-QUI/.test(window.SITE_CONFIG.supabaseUrl + window.SITE_CONFIG.supabaseAnonKey);
