# Sistema di voto per le ere ("multi-like") — Design

**Data**: 2026-07-02 · **Stato**: approvato in brainstorming, in attesa di review finale

## Obiettivo

Permettere ai visitatori di esprimere apprezzamento per le ere del CV e di vedere la
classifica aggregata. Doppio scopo: engagement (il voto è un gioco coerente col tono del
sito) e raccolta dati (quali ere piacciono di più).

## Modello di voto

**Multi-like per era**: ogni visitatore può mettere/togliere un ♥ a ciascuna era,
indipendentemente dalle altre (toggle, come un "like"). Niente stelline/punteggi: con il
traffico di un sito personale le medie sono rumore statistico e la classifica per medie
risulterebbe distorta (si votano solo le ere visitate). La classifica è per numero
assoluto di like.

- Un like per era per visitatore, enforcement client-side: `localStorage` chiave
  `cv_votes` = array JSON delle chiavi era likate (coerente con `cv_theme` esistente).
- Il like è revocabile (unlike → decrement).
- Nessun dato personale: i voti sono contatori anonimi. Nessun consenso aggiuntivo
  necessario.

## Architettura

### Storage — Upstash Redis (Vercel Marketplace, piano Free)

- Il sito è su Vercel (verificato dagli header di produzione); l'integrazione
  Marketplace inietta automaticamente le env var nel progetto.
- Un solo hash Redis: `era_votes`, un campo per chiave era (`terminal`, `pixel`, …).
- Free tier (500k comandi/mese) ampiamente sufficiente.
- Client: SDK `@upstash/redis` (REST, compatibile serverless), env var
  `KV_REST_API_URL` / `KV_REST_API_TOKEN`.

### API — `src/routes/api/votes/+server.ts`

- `GET` → `{ votes: Record<Theme, number> }` — tutti i totali (HGETALL). Le ere senza
  voti valgono 0. Risposta costruita iterando `ERA_ORDER` (fonte di verità in
  `src/lib/store.ts`): un'era futura aggiunta a `ERA_ORDER` funziona automaticamente.
- `POST { era: Theme, action: 'like' | 'unlike' }` → valida `era` contro `ERA_ORDER` e
  `action` contro i due valori ammessi (altrimenti 400); `HINCRBY era_votes <era> ±1`;
  se il risultato di un unlike è negativo, riporta il campo a 0 (HSET). Risponde con i
  totali aggiornati (stesso shape della GET).
- **Rate limit** per IP (`event.getClientAddress()`): chiave `rl:<ip>` con `INCR` +
  `EXPIRE 60`; oltre ~20 richieste/min → 429. Scoraggia lo spam da script; a questa
  scala non serve di più.
- La pagina resta `prerender = true`; la route API è esclusa dal prerender e gira come
  funzione serverless Vercel.

### Client — `src/lib/votes.ts`

Modulo helper con lo stesso patto di robustezza di `analytics.ts`: **il voto non deve
mai rompere l'app**.

- Stato Svelte: set delle ere likate (idratato da `localStorage`, SSR-safe con guard
  `typeof window`) + record dei totali.
- `toggleVote(era)`: aggiornamento **ottimistico** (UI e localStorage subito), poi POST;
  in caso di errore di rete l'errore è silenzioso (nessun revert, nessun toast — il
  contatore si riallinea alla prossima GET).
- Fetch dei totali **lazy**: alla prima apertura del popover classifica (non al boot,
  per non aggiungere richieste al first paint). Il conteggio accanto al ♥ appare quando
  i totali sono noti; prima si mostra solo il cuore.
- Ad ogni like spara anche l'evento Clarity `vote-<era>` via un helper in
  `analytics.ts` (dato incrociato con le sessioni, gratis).

### UI — `src/lib/components/EraVote.svelte`

Componente autonomo (non dentro `Timeline.svelte`, già a ~1100 righe), montato in
`+page.svelte` accanto alla Timeline, visibile solo dopo il flag `booted` come il resto.

- **Widget**: bottone ♥ toggle riferito all'**era corrente** (`$currentTheme`) con
  accanto il conteggio like di quell'era. `aria-pressed` per lo stato, label
  accessibile "Metti mi piace all'era <nome>".
- **Popover classifica**: il conteggio accanto al ♥ è esso stesso un bottone
  ("Vedi la classifica delle ere") che apre un pannello con le dodici ere ordinate per
  like decrescenti: icona, label, barra percentuale (relativa al massimo), conteggio.
  Due bottoni distinti quindi: ♥ (toggle like) e conteggio (apre/chiude la classifica).
  Chiusura con `Esc` e click fuori; `aria-expanded` sul trigger.
- **Micro-animazione** di conferma al like (pop/burst del cuore) gated da
  `prefers-reduced-motion`, come ogni animazione del sito.

### Tematizzazione per era — requisito esplicito, non opzionale

Il widget adotta **lo stesso idioma della Timeline**: wrapper con classe
`vote-widget theme-{$currentTheme}` e blocchi di override CSS per era
(`:global(:root) .theme-terminal …`). Per tenere i blocchi compatti, lo stile base del
widget è scritto su **custom properties** (`--vote-bg`, `--vote-accent`, `--vote-border`,
`--vote-radius`, `--vote-font`) e ogni era ridefinisce solo quelle (~5 righe/era) più
eventuali dettagli distintivi (es. bordo tratteggiato fosforo per `terminal`, pixel/bevel
per `pixel` e `winxp`, vetro frosted per `glass`). Tutte le **dodici** ere devono avere
il proprio blocco: il widget deve sembrare nativo di ogni era, esattamente come la
Timeline.

## Gestione errori

- Env var assenti (es. fork locale senza `.env.local`): la route risponde 503 e il
  client degrada in silenzio (widget mostra solo il cuore locale, niente conteggi).
- Redis irraggiungibile: try/catch nella route → 503; client silenzioso come sopra.
- `localStorage` inaccessibile (private mode): il toggle funziona in memoria per la
  sessione.

## Test e qualità

- `npm run check` a 0 errori (gate di progetto).
- Verifica manuale end-to-end in dev con le credenziali Upstash in `.env.local`:
  like/unlike, persistenza al reload, classifica, rate limit, tematizzazione su tutte le
  dodici ere, comportamento con `prefers-reduced-motion` attivo.

## Passaggi manuali (Vercel) — prerequisito

1. Dashboard Vercel → progetto **dev-curriculum** → tab **Storage** → crea un database
   **Upstash for Redis** (Marketplace), piano **Free**, regione EU più vicina alle
   funzioni (es. Frankfurt).
2. **Connect Project** → dev-curriculum, tutti gli environment, prefisso env var `KV_`
   (default) → `KV_REST_API_URL` / `KV_REST_API_TOKEN` iniettate automaticamente.
3. Copiare lo snippet `.env.local` dal Quickstart dello store nella root del progetto
   (già in `.gitignore`) per lo sviluppo locale.
4. Il primo deploy successivo alla connessione rende le env var attive in produzione.

## Fuori scope

- Autenticazione/deduplicazione server-side dei visitatori (fingerprinting): sproporzionata
  per lo scopo; il rate limit basta.
- Classifica "storica" o serie temporali dei voti.
- Voto nelle singole ere fuori dal widget (es. bottoni dentro i temi): il widget vive
  solo accanto alla Timeline.
