# I miei siti

Raccolta di siti personali pubblicati con **GitHub Pages**, con una homepage di accesso e un unico database **Supabase** (piano gratuito) dove ogni utente salva i propri dati, sincronizzati in tempo reale tra dispositivi.

```
index.html                  Homepage: accesso, registrazione, elenco dei siti, copia di sicurezza
shared/config.js            ← l'unico file da configurare (URL e chiave Supabase)
shared/sites.js             Elenco dei siti mostrati in homepage
shared/auth.js              Accesso con email e password
shared/store.js             Salvataggio dati per utente + sincronizzazione in tempo reale
shared/userbar.js           Barra "← Tutti i siti · Salvato · email · Esci"
shared/base.css             Stile comune
siti/percorso-fodmap/       Percorso Low-FODMAP (terapia, tabella FODMAP, pasti e profilo)
siti/modello/               Modello da copiare per un nuovo sito
supabase/schema.sql         Tabella e regole di sicurezza del database
```

## Dove stanno i dati

I dati **non** sono nel repository. GitHub Pages pubblica solo file statici; login e dati stanno su Supabase. Ogni riga del database appartiene a un utente e le regole di sicurezza (Row Level Security in `supabase/schema.sql`) fanno sì che ognuno legga e modifichi solo le proprie righe. La chiave “anon” in `config.js` è pensata per stare nel codice pubblico: da sola non dà accesso ai dati di nessuno.

---

## Messa online, passo per passo (circa 15 minuti)

### 1. Crea il progetto Supabase
1. Vai su <https://supabase.com>, crea un account gratuito e clicca **New project**.
2. Scegli un nome, una password del database (salvala) e la regione **Central EU (Frankfurt)**, la più vicina all'Italia.
3. Quando il progetto è pronto, apri **SQL Editor → New query**, incolla tutto il contenuto di `supabase/schema.sql` e premi **Run**. Deve comparire “Success”.

### 2. Collega il sito al database
1. In Supabase apri **Project Settings → API** (in alcune versioni “Data API” e “API Keys”).
2. Copia **Project URL** e la chiave **anon / publishable**.
3. Incollale in `shared/config.js` al posto di `https://TUO-PROGETTO.supabase.co` e `INCOLLA-QUI-LA-CHIAVE-ANON`.
4. **Non usare mai** la chiave `service_role` / `secret`: darebbe accesso a tutti i dati.

### 3. Pubblica su GitHub Pages
1. Crea un repository su GitHub e carica tutti i file (compreso `.nojekyll`).
2. **Settings → Pages → Build and deployment**: Source **Deploy from a branch**, Branch **main**, cartella **/ (root)**, poi **Save**.
3. Dopo un minuto il sito è su `https://TUO-UTENTE.github.io/NOME-REPO/`.

> Su un account GitHub gratuito, Pages funziona solo con repository **pubblici**. Va bene: nel codice non ci sono dati personali né chiavi segrete.

### 4. Indica a Supabase l'indirizzo del sito
In Supabase **Authentication → URL Configuration**:
- **Site URL**: `https://TUO-UTENTE.github.io/NOME-REPO/`
- **Redirect URLs**: aggiungi `https://TUO-UTENTE.github.io/NOME-REPO/**`

Serve perché i link delle email (conferma account, nuova password) riportino al tuo sito.

### 5. Crea gli account e chiudi le registrazioni
1. Apri il sito e registrati con la tua email; fai registrare anche la tua compagna. Confermate l'indirizzo dal link ricevuto via email.
2. Poi in Supabase **Authentication → Sign In / Providers** (o “Settings”) disattiva **Allow new users to sign up**. Da quel momento nessun altro può creare un account; potete comunque aggiungerne da **Authentication → Users → Add user**.

---

## Aggiungere un nuovo sito
1. Copia `siti/modello` in una nuova cartella, es. `siti/spese-casa`.
2. Nel suo `index.html` cambia `const APP_ID = "modello"` con un nome unico, es. `"spese-casa"`.
3. Aggiungi una voce in `shared/sites.js`.

Il nuovo sito ha già accesso, salvataggio e sincronizzazione:
```js
const user = await AppStore.init(APP_ID);   // richiede l'accesso
AppStore.get("chiave", valorePredefinito);  // legge
AppStore.set("chiave", valore);             // salva qualsiasi dato JSON
AppStore.onChange((chiave, valore) => {});  // modifica arrivata da un altro dispositivo
```
Non servono nuove tabelle: tutti i siti usano la stessa, separati da `APP_ID`.

## Da sapere sul piano gratuito
- Il progetto va **in pausa dopo 7 giorni senza attività**. I dati non si perdono: si riattiva dalla dashboard di Supabase con un clic.
- **Niente backup automatici**: usa ogni tanto “Scarica i miei dati” nella homepage, che salva un file con tutti i tuoi dati.
- Se la connessione cade, i siti continuano a funzionare e salvano sul dispositivo; appena torna internet, i dati vengono inviati al database.

## Provare in locale
Serve un piccolo server (aprire il file con doppio clic non basta):
```
python3 -m http.server 8000
```
poi apri <http://localhost:8000> e aggiungi `http://localhost:8000/**` tra i Redirect URLs di Supabase.
