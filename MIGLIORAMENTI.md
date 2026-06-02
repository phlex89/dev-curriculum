# Piano di miglioramenti estetici & UX — Time-Machine Resume

> Documento vivo. **Le Fasi 1, 2 e 3 della roadmap sono state implementate** (vedi
> §8 e i marcatori di stato sulle singole voci). Raccoglie miglioramenti estetici, di
> micro-interazione, animazione, usabilità, accessibilità e performance per portare
> ogni "era" al livello successivo, **senza snaturare il concetto** di nessuna delle
> quattro soluzioni.
>
> Ogni voce è marcata con un livello di sforzo: 🟢 quick win (minuti/poche ore) ·
> 🟡 medio (mezza giornata) · 🔴 importante (1+ giorni / scelta architetturale).
> E con un impatto percepito: ⭐ basso · ⭐⭐ medio · ⭐⭐⭐ alto.
>
> **Stato di implementazione** (verificato sul codice il 2026-06-02):
> `✅` fatto · `🟡` parziale o variante · `⬜` non ancora implementato.

---

## Indice
1. [Filosofia & criteri](#filosofia)
2. [Miglioramenti trasversali (tutto il sito)](#trasversali)
3. [Era 1 — Terminale Unix](#terminale)
4. [Era 2 — Windows XP](#winxp)
5. [Era 3 — Modern Flat / Bento](#bento)
6. [Era 4 — Il Futuro / 3D](#futuro)
7. [Il componente Timeline](#timeline)
8. [Roadmap consigliata per fasi](#roadmap)

---

<a name="filosofia"></a>
## 1. Filosofia & criteri

Il progetto ha un'idea forte: **un CV che attraversa le ere della UI/UX**. La regola
d'oro dei miglioramenti è la *fedeltà d'epoca* — ogni rifinitura deve rendere il tema
**più credibile** rispetto all'epoca che evoca, mai più "moderno" in modo anacronistico.
Esempi: nel Terminale ogni animazione deve sembrare un limite tecnico dell'hardware
CRT, non un effetto CSS del 2026; in Windows XP ogni dettaglio deve citare l'OS reale.

Tre direttrici comuni a tutte le ere:
- **Onboarding implicito** — il visitatore (recruiter) deve capire *in 2 secondi* che
  può cambiare epoca e come interagire, senza istruzioni esplicite.
- **Coerenza del "carattere"** — ogni era ha una personalità; le micro-interazioni
  devono rafforzarla (il Terminale è ruvido e tecnico, XP è giocoso e nostalgico,
  Bento è pulito e raffinato, il Futuro è sospeso e luminoso).
- **Nessun vicolo cieco** — l'utente non deve mai trovarsi in uno stato senza uscita
  (finestra trascinata fuori schermo, terminale "vuoto" senza sapere che fare, ecc.).

---

<a name="trasversali"></a>
## 2. Miglioramenti trasversali

### 2.1 Prima visita & orientamento
- ✅ 🟡 ⭐⭐⭐ **Hint di benvenuto sulla Timeline alla prima visita.** Alla primissima
  apertura (flag in `localStorage`), un piccolo tooltip pulsante sopra la Timeline:
  *"Sei nel 2015. Trascinati nel tempo →"* con una freccia che ammicca verso i nodi.
  Si dissolve al primo cambio tema o dopo 6s. *(Timeline.svelte, chiave `cv_seen_timeline`.)*
- ✅ 🟡 ⭐⭐ **Deep-link per tema.** Tema sincronizzato con l'hash dell'URL
  (`#terminal`, `#winxp`, …) via `history.replaceState`; il deep-link in apertura vince
  sulla preferenza salvata e i pulsanti avanti/indietro cambiano era (`hashchange`).
  *(store.ts + +page.svelte.)*
- ⬜ 🟢 ⭐⭐ **Scelta iniziale intelligente.** Alla prima visita assoluta, anziché partire
  sempre da Bento, valutare di partire dal **Terminale** (il punto di partenza
  cronologico) per raccontare la storia dall'inizio → effetto "viaggio nel tempo".
  Da discutere: Bento è il più leggibile come prima impressione. Opzione: micro-intro
  animata di 1.5s che parte dal Terminale e "scivola" fino a oggi.

### 2.2 Transizione tra ere
- ✅ 🔴 ⭐⭐⭐ **Transizione tematica, non solo cross-fade.** Sopra il cross-dissolve, un
  overlay calcola la direzione dagli indici di `ERA_ORDER`: **scan/glitch CRT verde**
  andando indietro nel tempo, **bloom luminoso** andando avanti. Rispetta
  `prefers-reduced-motion`. *(+page.svelte.)*
- ✅ 🟡 ⭐⭐ **Effetto audio opzionale (muto di default).** Toggle 🔊 flottante in basso a
  sinistra; al cambio era riproduce un suono d'epoca sintetizzato al volo con la Web
  Audio API (beep CRT, chime XP, "pop" Bento, drone sci-fi Futuro). Opt-in, persistito
  (`cv_audio`). *(audio.ts + +page.svelte.)*
- ✅ 🟢 ⭐ **Rispetto già presente di `prefers-reduced-motion`** — esteso a ogni nuova
  animazione introdotta (FX di transizione, bloom, fade canvas, windowPop, boot XP).

### 2.3 Responsive / mobile (criticità attuale diffusa)
- 🟡 🔴 ⭐⭐⭐ **Le finestre XP e il layout 3D non sono pensati per mobile.** **XP: fatto** —
  sotto i 600px le finestre si aprono massimizzate, drag disabilitato, niente coordinate
  desktop. **3D: parziale** — il bloom è disattivato sotto i 760px, ma le particelle non
  vengono ulteriormente ridotte e il tilt resta attivo (vedi §6).
- ✅ 🟡 ⭐⭐ **Suggestions del Terminale e cards 3D / altezza viewport.** Adottato `100dvh`
  su tutte le ere così la barra browser mobile non taglia la Timeline.
- ✅ 🟢 ⭐⭐ **Timeline su mobile**: label espansa solo per l'era attiva, solo icone per le
  altre (comportamento compatto già attivo).

### 2.4 Accessibilità
- ✅ 🟡 ⭐⭐⭐ **Navigazione da tastiera sulla Timeline**: frecce ←/→ (e ↑/↓, Home/End) per
  spostarsi, `Enter`/`Space` per attivare, focus-ring visibile e coerente per tema.
- ⬜ 🟡 ⭐⭐ **Focus management nel cambio tema**: dopo il cambio, spostare il focus su un
  landmark del nuovo tema e annunciare il cambio via `aria-live` ("Era: Windows XP, 2001").
- ✅ 🟢 ⭐⭐ **Contrasto**: i grigi secondari del 3D sono stati schiariti (es. tech-stack
  `#aab4e8`, muted `rgba(190,200,255,.88)`), sopra soglia AA.
- ✅ 🟢 ⭐ **`prefers-color-scheme`** per scegliere il default light/dark di Bento (vedi 5.x).
- ✅ 🟡 ⭐⭐ **`<title>` dinamico per era** ("Stefano Tedeschi — CV · Windows XP", ecc.).

### 2.5 SEO / meta / condivisione
- ✅ 🟢 ⭐⭐ **Open Graph / Twitter Card** con immagine dedicata (`og-image.png`),
  `og:*` e `twitter:*` completi in `app.html`.
- ✅ 🟢 ⭐ **`<meta name="description">`, `lang="it"`, JSON-LD `Person`** presenti in `app.html`.

### 2.6 Performance
- ✅ 🟡 ⭐⭐ **Lazy-load di Three.js**: `ThreeD.svelte` importa `three` (e gli add-on di
  post-processing) dinamicamente (`await import('three')`); il bundle WebGL finisce in un
  chunk separato caricato solo entrando nell'era Futuro. *(Verificato nel build.)*
- ✅ 🟢 ⭐ **Cleanup + pausa rAF**: oltre a `cancelAnimationFrame`/`dispose`, il loop del 3D
  va in pausa quando il tab è nascosto (`visibilitychange`).
- ⬜ 🟢 ⭐ **Preload del wallpaper XP** solo quando si è prossimi a entrare in XP, oppure
  `loading` strategy, per non competere col first paint di Bento.

---

<a name="terminale"></a>
## 3. Era 1 — Terminale Unix (Anni '80–'90)

**Concetto da preservare:** prompt CRT a fosfori verdi, interazione testuale, ruvidezza
tecnica. Tutto ciò che si aggiunge deve sembrare *vincolo dell'hardware*, non grafica.

### Estetica / atmosfera
- ✅ 🟢 ⭐⭐⭐ **Cursore a blocco lampeggiante** (`▋`) in stile vero terminale, al posto del
  caret nativo. Lampeggio `steps(1, end)`, cursore "vuoto" quando non è a fuoco.
- ⬜ 🟢 ⭐⭐ **Flicker/jitter CRT sottilissimo**: leggera variazione di opacità/luminosità
  globale (0.5–1%) a frequenza irregolare + un impercettibile spostamento subpixel.
- ⬜ 🟡 ⭐⭐ **Curvatura/bombatura CRT** opzionale: vignettatura agli angoli + `border-radius`
  interno per simulare il vetro bombato del monitor.
- ⬜ 🟢 ⭐⭐ **Aberrazione cromatica RGB** minima sui bordi del testo (text-shadow rosso a
  sx, blu a dx, ~0.5px) — firma visiva dei monitor a fosfori.
- ⬜ 🟢 ⭐ **Bloom sui glifi**: aggiungere un secondo livello di `text-shadow` più ampio e
  tenue per il "glow" da fosforo saturo (oggi un solo livello).

### Animazioni
- ✅ 🟡 ⭐⭐⭐ **Boot sequence all'avvio.** Sequenza BIOS/POST (memory check, "Loading
  StefanoOS…", barra ASCII) eseguita una volta per sessione (`sessionStorage`), poi
  prompt pronto. Rispetta reduced-motion.
- ✅ 🟡 ⭐⭐ **Output "stampato" carattere per carattere** (typewriter ~9ms/char) con skip
  premendo un tasto; output lunghi/ASCII e reduced-motion stampano subito.
- 🟡 🟢 ⭐ **`neofetch`**: presente, ma con logo ASCII monocromatico (rombo). Da fare il
  **gradiente verde** e/o un ritratto ASCII personalizzato.

### Usabilità (grande potenziale qui)
- ✅ 🟡 ⭐⭐⭐ **Storia dei comandi con ↑/↓** (come ogni shell vera).
- ✅ 🟡 ⭐⭐⭐ **Autocompletamento con `Tab`** su comandi e nomi file; doppio Tab → lista
  delle opzioni (con prefisso comune).
- ⬜ 🟢 ⭐⭐ **`Ctrl+L` per clear**, `Ctrl+C` per annullare la riga corrente (eco `^C`).
- 🟡 🟢 ⭐⭐ **Comando `help`**: presente ma non ancora suddiviso in categorie; manca il
  comando `open <linkedin|website|mail>` che apre davvero i link.
- ✅ 🟢 ⭐⭐ **Comando `cv` / `download`** che scarica il PDF (`/cv-stefano-tedeschi.pdf`).
- ⬜ 🟢 ⭐ **Le Quick Actions** che evidenziano i comandi già provati (stato "visitato").
- ⬜ 🟢 ⭐ **`whoami`, `pwd`, `date`, `uname -a`, `history`** — comandi "gratis".

### Easter egg (in tema, da non esagerare)
- ⬜ 🟢 ⭐⭐ **`matrix`**: oggi è solo background animato; valutare la pioggia di caratteri
  katakana verdi (canvas) con `Esc`/tasto per uscire.
- ⬜ 🟢 ⭐ **`sudo make me a sandwich`** (xkcd); **`rm -rf /`** (finta paura); **`coffee`**
  (ASCII tazza). Oggi `sudo` dà solo il warning sudoers classico.

### Accessibilità
- ⬜ 🟡 ⭐⭐ Garantire `aria-live="polite"` sull'area output così lo screen reader annuncia
  le risposte ai comandi (il focus sull'input dopo ogni comando è già gestito).

---

<a name="winxp"></a>
## 4. Era 2 — Windows XP (Inizio anni 2000)

**Concetto da preservare:** desktop XP fedele, finestre, taskbar, nostalgia "Luna".
Qui il fascino sta nella *fedeltà maniacale all'originale* + giocosità.

### Estetica / fedeltà
- ⬜ 🟡 ⭐⭐⭐ **Titlebar Luna più fedele**: aggiungere il "lucido" in alto (highlight bianco
  sui primi ~40%) e bottoni con bordo perlato/glossy (oggi gradiente piatto).
- ✅ 🟡 ⭐⭐ **Icone reali al posto delle emoji.** Sostituite con icone SVG in stile Luna
  (`XpIcon.svelte`: cartella, My Computer, cestino, ecc.) su desktop, finestre, taskbar
  e menu Start.
- ⬜ 🟢 ⭐⭐ **Font rendering**: titlebar in **Trebuchet MS bold** (il vero font dei titoli
  XP) anziché Tahoma; `font-smoothing` tipico.
- 🟡 🟢 ⭐⭐ **Selezione icone desktop**: lo **stato "selezionato"** (label blu) è fatto; manca
  il rettangolo di selezione semitrasparente trascinando sul desktop.
- ⬜ 🟢 ⭐ **Ombre finestre** più morbide e bordo Luna rifiniti.

### Micro-interazioni & animazioni
- ✅ 🟡 ⭐⭐⭐ **Animazione apri/chiudi/minimizza finestra.** `transform: scale` + opacity +
  translate verso il basso con easing (`windowPop`), rispetta reduced-motion. *(Variante
  rispetto allo zoom esatto dal punto-icona / risucchio al tab specifico.)*
- ✅ 🟢 ⭐⭐ **Doppio click sulle icone desktop** per aprire; singolo click solo per
  selezionare.
- 🟡 🟢 ⭐⭐ **Menu Start**: voce evidenziata in blu, separatori e pannello laterale azzurro
  già presenti; manca il "sound" allo scorrimento.
- ⬜ 🟢 ⭐⭐ **Orologio tray con tooltip data completa** all'hover + fumetto "Aggiornamenti".
- ⬜ 🟢 ⭐ **Clippy che reagisce**: oggi è sempre visibile; manca l'animazione d'entrata
  ritardata, il pulsante "×" per chiuderlo e le battute alternate.

### Usabilità (criticità reali)
- ✅ 🔴 ⭐⭐⭐ **Drag fuori schermo.** Il drag è vincolato al viewport: la titlebar resta
  sempre raggiungibile *(draggable.ts)*.
- ✅ 🔴 ⭐⭐⭐ **Mobile.** Sotto i 600px finestre massimizzate, drag disabilitato, niente
  coordinate desktop; menu/taskbar/Clippy compatti; pulsante Ingrandisci nascosto.
- ✅ 🟡 ⭐⭐ **Z-index/ordine**: il pannello destro del menu Start ("Il mio PC", "Documenti
  recenti", "Pannello di Controllo") ora apre finestre a tema (non è più un vicolo cieco).
- ⬜ 🟢 ⭐⭐ **Snap to edge** (trascinando in alto → massimizza).
- ⬜ 🟢 ⭐ **Cursore XP** custom (freccia classica di Windows).

### Easter egg
- 🟡 🟢 ⭐⭐ **BSOD → riavvio.** Il BSOD ora è seguito da un **finto riavvio con la
  schermata di boot XP** (logo + barra animata) prima di tornare al desktop. Manca solo il
  **suono di errore XP** opt-in.
- ⬜ 🟢 ⭐ **Avvio**: schermata di boot XP la *prima volta* che si entra nel tema (oggi la
  boot screen appare solo dopo il BSOD).

### Accessibilità
- ⬜ 🟡 ⭐⭐ Finestre come `role="dialog"` con `aria-labelledby`; `Esc` chiude la finestra in
  primo piano; focus trap leggero.
- ⬜ 🟢 ⭐ I `div` cliccabili (icone, taskbar) dovrebbero essere `<button>`/`role="button"`
  + gestione tastiera (oggi `svelte-ignore a11y_*`).

---

<a name="bento"></a>
## 5. Era 3 — Modern Flat / Bento (2015–oggi)

**Concetto da preservare:** griglia Bento asimmetrica, pulizia, tipografia raffinata,
estetica "Apple/portfolio 2020s". Qui i miglioramenti sono di *rifinitura e delizia*.

### Estetica
- ✅ 🟡 ⭐⭐⭐ **Avatar reale al posto del placeholder "ST".** `avatar.svg` con fallback al
  monogramma in caso di errore di caricamento; anello a gradiente conico come cornice.
- ⬜ 🟢 ⭐⭐ **Profondità delle box**: aggiungere un bordino interno chiaro
  (`inset 0 1px 0 rgba(255,255,255,.6)`) in light mode per il look "vetro smerigliato".
- 🟡 🟢 ⭐⭐ **Box social più caratterizzate**: la freccia "→" che scivola all'hover è fatta;
  mancano i glyph di brand reali (es. LinkedIn SVG) al posto di "in"/"@"/🌐.
- ⬜ 🟢 ⭐ **Accento cromatico per categoria**: un puntino/linea colorata su ogni `box-label`.

### Micro-interazioni & animazioni
- ✅ 🟡 ⭐⭐⭐ **Tilt/parallax leggero sulle box all'hover** (±2–3° verso il cursore),
  disattivato con reduced-motion *(action `tilt`)*.
- ✅ 🟡 ⭐⭐ **Spotlight che segue il cursore** sulle box (radial-gradient via `--mx/--my`).
- ✅ 🟡 ⭐⭐ **Scroll-reveal** quando le box entrano in viewport (`IntersectionObserver`,
  action `reveal`).
- ✅ 🟢 ⭐⭐ **Marquee pausabile all'hover/focus** (mask ai bordi già presente).
- 🟡 🟢 ⭐⭐ **Hover sulle righe esperienza**: evidenziazione `accent-soft` + `translateX`
  fatta; manca l'espansione on-click degli `highlights` completi.
- 🟡 🟢 ⭐ **Toggle dark/light animato**: **View Transition circolare** dal punto del bottone
  fatta (con fallback); manca il morph/rotazione dell'icona ☀️↔🌙.

### Usabilità
- ✅ 🟢 ⭐⭐⭐ **Persistere la preferenza dark/light** in `localStorage` (`cv_bento_dark`) +
  init da `prefers-color-scheme`.
- ⬜ 🟢 ⭐⭐ **Mostrare i highlights**: espansione on-click della box esperienza con i bullet
  completi (oggi solo `description`).
- ⬜ 🟢 ⭐ **CTA download CV** come box dedicata (scarica PDF).

### Accessibilità
- ✅ 🟢 ⭐⭐ Toggle tema con `aria-label` dinamico; contrasti `--text-sec` verificati.
- ⬜ 🟢 ⭐ Le box-link social: aggiungere testo accessibile "(si apre in nuova scheda)".

---

<a name="futuro"></a>
## 6. Era 4 — Il Futuro / 3D & Glassmorphism (2026+)

**Concetto da preservare:** scena WebGL immersiva, glassmorphism neon, "padronanza
tecnica". Qui i miglioramenti puntano a *wow controllato* + leggibilità + performance.

### Estetica / scena 3D
- ✅ 🟡 ⭐⭐⭐ **Reattività della scena agli eventi UI**: l'hover su una card inietta
  "energia" (che decade) → accelera il drift, intensifica il bloom e scalda l'hue del
  torus knot. *(pulseScene.)*
- ✅ 🟡 ⭐⭐ **Bloom/post-processing reale** (`UnrealBloomPass` via `EffectComposer`), con
  *gating*: attivo solo su viewport ampi e con motion consentito, fallback al rendering
  diretto.
- ⬜ 🟢 ⭐⭐ **Star-parallax a strati col mouse**: differenziare la velocità di reazione dei
  3 layer di particelle al cursore (oggi parallasse solo sulla camera).
- ✅ 🟢 ⭐ **Colore del torus knot reattivo nel tempo** (hue shift lentissimo) per un cielo
  "che respira".

### Glassmorphism / UI
- ✅ 🟡 ⭐⭐⭐ **Animazione di ingresso delle card** (`spaceIn`: fade + rise + de-blur,
  staggered), rispetta reduced-motion.
- ⬜ 🟢 ⭐⭐ **Bordo luminoso reattivo (conic-gradient border che ruota)** sulle card all'hover.
- ✅ 🟢 ⭐⭐ **Spotlight cursore + tilt potenziato**: tilt portato a ±7° con spotlight neon
  via `::after`.
- ✅ 🟢 ⭐⭐ **Leggibilità**: testi secondari/tech-stack schiariti; vignetta dietro le card.

### Usabilità / performance
- ✅ 🟡 ⭐⭐⭐ **Stato di caricamento WebGL**: il canvas fa **fade-in da nero** al primo frame
  renderizzato, abbinato al dynamic import di three (niente "salti").
- ✅ 🟡 ⭐⭐ **Pausa rAF quando il tab è nascosto** (`visibilitychange`) + dispose in cleanup.
- 🟡 🟢 ⭐⭐ **Mobile**: il bloom è disattivato sotto i 760px; mancano la riduzione ulteriore
  delle particelle e la disattivazione del tilt su GPU deboli/schermi piccoli.
  Il `pixelRatio` max 1.75 è già una buona base.
- ⬜ 🟢 ⭐ **Contenuti**: l'era Futuro mostra ancora meno contatti delle altre (solo email +
  LinkedIn); uniformare telefono/website o presentarli come "endpoint/handle".

### Accessibilità
- 🟡 🟡 ⭐⭐ Con `prefers-reduced-motion` la scena dimezza le particelle e ferma il moto;
  manca ancora il **fallback statico** (gradiente fermo) per chi disabilita del tutto WebGL
  o ha GPU assente.

---

<a name="timeline"></a>
## 7. Il componente Timeline (l'elemento che unisce tutto)

La Timeline è il filo narrativo: merita cura speciale perché è *sempre* visibile.

- ✅ 🟡 ⭐⭐⭐ **Riempimento progressivo della traccia.** La `timeline-fill` si riempie fino
  al nodo attivo (barra di avanzamento temporale), con colore per-tema.
- ⬜ 🟡 ⭐⭐ **Anteprima all'hover sul nodo**: micro-preview (nome+anno/thumbnail) di un'era
  non attiva prima di cliccare.
- ✅ 🟡 ⭐⭐⭐ **Navigazione da tastiera**: ←/→/↑/↓/Home/End/Enter, `role="tablist"` +
  `role="tab"`, `aria-selected`.
- ✅ 🟢 ⭐⭐ **Label leggibile dell'era attiva** con micro-transizione (`fadeIn` + espansione
  della pillola).
- ⬜ 🟢 ⭐⭐ **Indicatore di direzione**: animare il nodo attivo con un piccolo "scatto" nella
  direzione del viaggio (oggi la direzione è resa dall'FX a schermo intero, non dal nodo).
- ⬜ 🟢 ⭐ **Coerenza tematica Bento**: dare alla Timeline in Bento un tocco "pill iOS" più
  marcato (oggi eredita quasi tutto lo stile base).
- 🟡 🟢 ⭐ **Su mobile**: la label solo-attivo riduce l'overflow; resta da testare a fondo su
  schermi molto stretti.

---

<a name="roadmap"></a>
## 8. Roadmap consigliata per fasi

Ordine pensato per **massimo impatto/sforzo** e per costruire le basi prima delle chicche.

### Fase 1 — Quick wins ad alto impatto (mezza giornata) 🟢 ✅ *Completata*
- ✅ Bento: **persistere dark/light + init da `prefers-color-scheme`**, marquee pausabile,
  hover righe esperienza.
- ✅ Terminale: **cursore a blocco lampeggiante**, storia comandi ↑/↓, `download/cv`.
- ✅ WinXP: **vincolare il drag al viewport** (no finestre perse), doppio-click per aprire.
- ✅ Timeline: **navigazione da tastiera** + ruoli ARIA tab.
- ✅ Trasversali: `100dvh`, `<title>` dinamico per era, OG image.

### Fase 2 — Fedeltà & delizia (1–2 giorni) 🟡 ✅ *Completata*
- ✅ Terminale: **boot sequence** + output typewriter + autocomplete Tab.
- ✅ WinXP: **icone SVG reali** al posto delle emoji + **animazioni apri/minimizza finestre**.
- ✅ Bento: **avatar reale**, tilt+spotlight soft, scroll-reveal.
- ✅ Futuro: **animazione ingresso card** + spotlight/tilt potenziato + fix contrasti.
- ✅ Timeline: **traccia che si riempie** + hint di benvenuto prima visita.

### Fase 3 — Wow & architettura (2+ giorni) 🔴 ✅ *Completata*
- ✅ Trasversali: **transizione tematica direzionale** (glitch indietro / bloom avanti),
  **deep-link per tema**, **audio opt-in** d'epoca.
- ✅ WinXP: **strategia mobile completa** (finestre massimizzate, no-drag) + BSOD→riavvio.
- ✅ Futuro: **lazy import di three**, **bloom post-processing**, pausa rAF, scena reattiva.
- ✅ Bento: View Transition circolare sul toggle tema.

### Backlog residuo (oltre le tre fasi pianificate)
Idee non incluse nelle fasi 1–3, raccolte per un'eventuale **Fase 4 di rifinitura**. Le
voci sono dettagliate (con stato `⬜`/`🟡`) nelle sezioni 2–7. In sintesi:
- **Trasversali**: scelta iniziale dal Terminale; focus-management + `aria-live` al cambio
  era; preload mirato del wallpaper XP.
- **Terminale**: flicker/curvatura/aberrazione CRT e bloom glifi; `Ctrl+L`/`Ctrl+C`;
  `help` a categorie + comando `open`; comandi "gratis" (`whoami`, `date`, …); `matrix`
  katakana e easter-egg testuali; `aria-live` sull'output; `neofetch` a gradiente.
- **WinXP**: titlebar Luna glossy + font Trebuchet; rubber-band di selezione; Clippy
  chiudibile/animato; tooltip orologio; snap-to-edge; cursore XP; suono d'errore al BSOD;
  boot al primo ingresso; semantica `role="dialog"`/`<button>`.
- **Bento**: bordino interno "vetro"; glyph di brand reali; accento cromatico per label;
  espansione highlights on-click; box CTA download CV; morph icona tema; "(nuova scheda)".
- **Futuro**: star-parallax a strati; bordo conic-gradient; mobile (particelle/tilt) e
  fallback statico senza WebGL; uniformare i contatti.
- **Timeline**: anteprima all'hover sul nodo; "scatto" direzionale del nodo attivo; pill
  iOS in Bento.
- **Nuove ere (espansione della timeline)**: il catalogo completo delle ere proposte vive in
  [`ERE.md`](./ERE.md). ✅ La **Pixel Art / 8-bit Gaming** (`#pixel`, `PixelArt.svelte`, in
  `ERA_ORDER` subito dopo `terminal`) è stata **implementata**: mini-gioco top-down (RPG
  overworld) con mappa a tile, camera che segue l'eroe, sei zone-edificio → `cv-data.ts`, dialog
  box NES, HUD quest `★ n/6` + `QUEST COMPLETE`; doppio binario (click su zona / "MOSTRA TUTTO"),
  fallback a directory statica sotto `prefers-reduced-motion`, asset CSS originali, chiptune.
  ✅ **Rifinitura (2026-06)**: villaggio riorganizzato come **viaggio sinistra→destra** in ordine
  narrativo lungo una **strada serpeggiante**, **densità pixel raddoppiata** (`--px = tile/16`)
  con tile/edifici/sprite ridisegnati, **Invio** chiude il dialog, e **4 easter egg** gated da
  `prefers-reduced-motion` — Konami code (modalità notte), bump+idle, pesca allo stagno, monete
  → zona segreta "Scheda Eroe" RPG (statistiche da `cv-data.ts`). Cue audio aggiunti:
  `pixelCoin`/`pixelBump`/`pixelSecret`. Dettaglio completo nella scheda §2 di `ERE.md`.
  La prossima candidata ad alto impatto è ora il **Web 1.0 / HTML Puro** (⬜): GeoCities,
  `<marquee>`/`<blink>` ricreati in CSS, tabelle per il layout, Times New Roman — colma il buco
  più ampio della timeline. Vedi le schede §2 e §3 di `ERE.md`.

---

### Nota finale
Tutti gli interventi rispettano la **fonte di verità unica** (`cv-data.ts`) e
l'isolamento per-tema dell'architettura: nessuna proposta duplica contenuti nei
componenti. Ogni animazione introdotta passa dal filtro `prefers-reduced-motion` già
adottato dal progetto. Stato verificato con `npm run build` e `npm run check` (0 errori)
e con prove di runtime nel browser sulle quattro ere.
