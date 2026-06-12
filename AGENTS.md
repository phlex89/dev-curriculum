# SvelteKit Time-Machine Resume

Questo documento descrive l'architettura, le tecnologie e le caratteristiche del progetto "Time-Machine Resume", un curriculum web interattivo sviluppato in SvelteKit che permette di navigare attraverso diverse "ere" dell'informatica, cambiando radicalmente l'interfaccia grafica.

## Concetto Centrale
Il progetto si basa sull'idea di un curriculum vitae dinamico. L'utente (es. un recruiter) può visualizzare le stesse informazioni (estratte dal vero CV di Stefano Tedeschi) attraverso undici design completamente diversi, ognuno rappresentativo di un'epoca specifica della UI/UX, navigabili tramite una **Timeline** globale persistente.

## Struttura e Architettura
L'applicazione è sviluppata utilizzando **SvelteKit 5** (Runes) e **TypeScript**. L'architettura prevede una netta separazione tra dati e presentazione:

1.  **Dati Centralizzati (`src/lib/cv-data.ts`)**: Contiene tutte le informazioni testuali del curriculum (Esperienze, Competenze, Istruzione, Contatti) in un unico file TypeScript. I temi pescano dinamicamente da questa singola fonte di verità.
2.  **Gestione Stato (`src/lib/store.ts`)**: Uno store reattivo (`currentTheme`) gestisce il tema attualmente attivo in tutta l'applicazione e lo persiste in `localStorage` (chiave `cv_theme`), così da ripristinarlo al reload. Lo store espone anche l'ordine cronologico delle ere (`ERA_ORDER`) usato per calcolare la direzione del viaggio nel tempo.
    -   **Deep-link per tema**: il tema attivo è sincronizzato con l'hash dell'URL (`#terminal`, `#teletext`, `#pixel`, `#web1`, `#winxp`, `#skeuo`, `#material`, `#brutalism`, `#bento`, `#parallax`, `#glass`, `#threed`) tramite `history.replaceState`. Un deep-link in apertura ha la precedenza sulla preferenza salvata; i pulsanti avanti/indietro del browser (`hashchange`) cambiano era. Un recruiter può così condividere "la versione Windows XP".
3.  **Orchestrazione (`src/routes/+page.svelte`)**: La pagina principale funge da router che monta a schermo il componente del tema selezionato. Il cambio di tema avviene con una **transizione cross-dissolve** morbida (`{#key}` + `fade`, in 450ms / out 300ms, layer assoluti sovrapposti, rispetta `prefers-reduced-motion`).
    -   **Transizione tematica direzionale**: sopra il cross-dissolve, un overlay calcola la direzione dal confronto degli indici in `ERA_ORDER` e riproduce un effetto coerente col concetto di macchina del tempo — un **glitch/scan CRT verde** andando indietro nel tempo, un **bloom luminoso** andando avanti. Disattivato con `prefers-reduced-motion`.
    -   **Audio opt-in d'epoca (`src/lib/audio.ts`)**: muto di default, attivabile da un toggle 🔊 flottante in basso a sinistra (allineato alla Timeline e tematizzato per era). Al cambio era riproduce un breve segnale sintetizzato al volo con la Web Audio API (beep CRT per il Terminale, arpeggio chiptune "console power-on" per la Pixel Art, **handshake modem 56k dial-up** per il Web 1.0 (`modemHandshake`: dial tone → DTMF → screech del carrier via `noiseBurst`), chime d'avvio per XP, tri-tone caldo per lo Skeuomorfismo, **tap sine pulito a due note per il Material Design**, buzzer ruvido dissonante per il Brutalismo, "pop" per Bento, **campanella di vetro cristallina per il Glassmorphism**, **swell aereo/pad ambient ascendente per il Parallax**, drone sci-fi per il Futuro): nessun file audio da scaricare. Il Web 1.0 espone inoltre `web1Modem()` (richiamato dal click sul throbber Netscape). La Pixel Art espone inoltre cue chiptune in-tema (`pixelBlip`/`pixelDiscover`/`pixelFanfare` per l'apertura di una zona, la scoperta di una nuova e il `QUEST COMPLETE`; `pixelCoin`/`pixelBump`/`pixelSecret` per gli easter egg — moneta raccolta, urto contro un ostacolo, sblocco della zona segreta). La preferenza è persistita (`cv_audio`).
4.  **Temi (`src/lib/themes/`)**: Ogni era è un componente Svelte completamente isolato e indipendente, con la propria logica e il proprio stile CSS.
5.  **Asset statici (`static/`)**: Contiene i wallpaper di Windows XP ("Bliss") in più risoluzioni (vedi sezione *Asset & Performance*).

---

## Tipografia (Google Fonts)
Ogni era usa un font scelto in base al contesto storico/estetico, caricato da Google Fonts in `src/app.html` (con `preconnect` e `display=swap`). Le famiglie sono caricate con i soli pesi effettivamente usati:

-   **JetBrains Mono** → Terminale (monospace leggibile, look da terminale dev); è anche il fallback del Teletext.
-   **Bedstead** → Teletext/Televideo: ricostruzione fedele del character ROM **Mullard SAA5050** (Ceefax/Mode 7), **pubblico dominio**, self-hostata e subsettata (`/static/fonts/bedstead.woff2`, ~7KB). Dichiarata su range di peso `400 700` per evitare il faux-bold sintetico sul bitmap; è l'unico font d'epoca con webfont perché **nessun SO ha un font teletext** (a differenza di Web1/XP/Skeuo che riusano font di sistema).
-   **Press Start 2P** → Pixel Art (font bitmap NES per HUD, dialog box e pannelli); **Silkscreen** per le **etichette delle zone** sulla mappa (font pixel ottimizzato per la leggibilità a piccola dimensione).
-   **Space Grotesk** → titoli/nomi di Modern Flat e Future, label della Timeline in Modern Flat.
-   **Inter** → corpo testo di Modern Flat e Future.
-   **Outfit** → tutta la tipografia del Glassmorphism (geometrico arioso, variable `wght 100–900` self-hostato latin-subset `/static/fonts/outfit.woff2`): la voce luminosa Big Sur/SF, distinta dall'Inter delle altre ere.
-   **Fraunces** → gli statement giganti del Parallax/Immersive Scroll: serif display ad **alto contrasto**, variable (opsz 9–144 / wght 100–900), **open source (SIL OFL)**, self-hostato/subsettato latin (`/static/fonts/fraunces.woff2`, ~67KB). È l'unico altro font caratteriale d'era oltre a Bedstead: lì la tipografia *è* l'estetica. Il corpo del Parallax riusa **Inter** (nessun secondo webfont).
-   **Orbitron** → titoli display futuristici (Future) e label della Timeline in Future.
-   **Anton** → titoli display giganti del Brutalismo (nome, header sezioni, numeri).
-   **Archivo** → corpo/sottotitoli del Brutalismo (grottesco industriale).
-   **Space Mono** → meta-label, dati, ticker e tag del Brutalismo (più label Timeline in quell'era).
-   **Roboto** → tutta la tipografia del Material Design (file variabile self-hostato latin-subset, `/static/fonts/roboto.woff2`), con la type-scale dell'era e label della Timeline in quell'era.
-   **Web 1.0** usa font di **sistema** (Times New Roman per il corpo, Courier per i meta/counter, Arial per il chrome Netscape): **nessun webfont**, coerente con l'autenticità d'epoca scelta per XP/Skeuo.
-   **Windows XP** usa **Tahoma/Segoe UI** di sistema (il font autentico dell'OS, nessun webfont).
-   **Skeuomorfismo** usa font di **sistema** (Georgia/Palatino per i titoli incisi, Lucida Grande/Helvetica per il corpo): nessun webfont aggiuntivo, in linea con l'autenticità d'epoca scelta per XP.

Il browser scarica solo i `woff2` realmente renderizzati nella pagina/tema corrente.

---

## Le Dodici "Ere" Implementate

### 1. Terminale Unix (Anni '80-'90)
**Componente:** `src/lib/themes/Terminal.svelte`
-   Simula un vero prompt dei comandi in stile console CRT (con effetto scanlines e fosfori verdi su font **JetBrains Mono**).
-   Sfondo con un leggero **pattern a tema**: griglia di puntini/linee verdi e glow radiale; il comando `matrix` ne attiva una versione più marcata e animata.
-   Interfaccia guidata a riga di comando: l'utente digita comandi fittizi (`ls`, `cat about.txt`, `show exp 1`, `neofetch`) per leggere le informazioni del CV.
-   Include pulsanti rapidi (Quick Actions) per facilitare l'uso senza digitare.
-   *Easter eggs:* Un comando `matrix` innesca lo sfondo animato con le stringhe verdi cadenti, e il comando `sudo` restituisce il classico warning di sistema.

### 2. Teletext / Televideo (1984)
**Componente:** `src/lib/themes/Teletext.svelte`
-   **Televideo RAI / Ceefax**: il testo trasmesso via TV, navigato digitando **numeri di pagina**. Lineage parallela al Terminale (schermo **TV**, non PC), per questo in `ERA_ORDER` è subito **dopo `terminal`**. Hash `#teletext`, label d'anno **"1984"**, icona 📺.
-   **Schermo nero a 40 colonne** centrato in una "stanza buia" (`radial-gradient`), con bordo CRT e **scanline**; **header blu** con numero pagina (giallo), nome (ciano), `TELEVIDEO` e **orologio broadcast live** (verde, aggiornato da `setInterval`).
-   **Magazine a pagine numerate**, tutti i contenuti da `cv-data.ts`: `100` indice (con **mosaico TV** disegnato a blocchi CSS, indice cliccabile e gag CONCEAL), `101` profilo, `102` esperienza (→ pagine di dettaglio `110+`), `103` origini, `104` competenze, `105` lingue, `106` formazione, `107` conferenze, `108` contatti (con download PDF), e la **pagina segreta `777`** (oroscopo del frontend + battuta nascosta).
-   **Doppio binario di navigazione / nessun vicolo cieco**: digitazione di un **numero a 3 cifre** (buffer mostrato in header, beep `teletextBeep` al cambio pagina) **+** tastierino numerico on-screen, indice cliccabile, **4 tasti FASTEXT colorati** (rosso/verde/giallo/ciano), frecce ◄/► per pagina precedente/successiva e tasto **SVELA** (`R`) per il reveal televideo.
-   **Estetica:** **8 colori puri** su nero (il blu è alzato a `#5a6bff` per leggibilità), **titoli a doppia altezza**, **barra rainbow** a mosaico come separatore. Tipografia **Bedstead** (ricostruzione del SAA5050 di Ceefax/Televideo, pubblico dominio, self-hostata ~7KB; fallback JetBrains Mono). Cue audio `case 'teletext'` (doppio blip secco, distinto dal beep CRT del Terminale).
-   **`prefers-reduced-motion`:** flicker "page rolling-in" disattivato; navigazione, contenuti e orologio restano pienamente funzionali e accessibili (tutti i controlli sono `<button>` reali).

### 3. Pixel Art / 8-bit Gaming (≈1988)
**Componente:** `src/lib/themes/PixelArt.svelte`
-   **Mini-gioco overworld top-down** in stile RPG 8-bit (Zelda/Pokémon, **non** un platformer): si cammina su una mappa a tile vista dall'alto (24×16, generata in `buildGrid()`, densità pixel `--px = tile/16`), con **camera che segue il personaggio**. Lineage parallela al Terminale (mondo console, non desktop), per questo in `ERA_ORDER` è subito **dopo `terminal`**.
-   **Sei zone** disposte come **viaggio sinistra→destra** in ordine narrativo, alternate in alto/basso e collegate da una **strada serpeggiante unica** (waypoint in `buildGrid()`): 🏠 CASA (about) → 🏰 CASTELLO (esperienze, un "piano" per lavoro) → 🛒 BOTTEGA (competenze come power-up) → 📜 BIBLIOTECA (formazione + conferenze) → ✉️ POSTA (contatti) → 🧰 SCRIGNO (download CV), tutte da `cv-data.ts`. Avvicinandosi a una zona si apre un **dialog box in stile NES** con l'intro "stampata" carattere per carattere (chiuso da **Invio** — prima completa il typewriter, poi chiude — o `Esc`).
-   **Doppio binario / nessun vicolo cieco**: i contenuti sono sempre raggiungibili anche senza giocare — ogni edificio è un `<button>` (click diretto) e un pannello **"MOSTRA TUTTO"** elenca tutte le zone. **HUD** in alto con quest log "★ n/6"; visitando tutte le zone parte la schermata **`QUEST COMPLETE`** + fanfara.
-   **Controlli**: frecce/WASD (movimento a passi sulla griglia con collisioni su matrice di tile calpestabili), **D-pad on-screen** su touch, click diretto su zona/edificio.
-   **Estetica:** palette NES satura a blocchi flat (erba `#008000`/`#00a800`, sentiero `#c84c0c`, acqua `#5c94fc`, oro `#fcd800`, eroe `#d82800`), font **Press Start 2P**, `image-rendering: pixelated`, edge duri e ombre a blocchi (niente blur). **Solo asset originali** disegnati in CSS (eroe a 4 direzioni con walk-cycle, edifici, alberi, monete).
-   **Easter egg** (tutti gated da `prefers-reduced-motion`): **Konami code** (`↑↑↓↓←→←→ B A`) attiva/disattiva la **modalità notte** (overlay blu + stelle) con fanfara e toast; **bump** (micro-shake direzionale + suono sbattendo contro ostacoli; l'eroe è posizionato via `--hx/--hy` così l'animazione non rompe centraggio/flip); **idle** ("Z" fluttuante dopo ~4,5s da fermo); **pesca** allo stagno (prompt `🎣 F` di fronte all'acqua, `F`/`Spazio` per un pescato random); **monete → zona segreta** (6 monete sulla strada, HUD `● n/6`; raccolte tutte appare la 🔮 PERGAMENA centrale — zona bonus che **non** conta nel quest `★ n/6` — con una "Scheda Eroe" RPG di statistiche **derivate da `cv-data.ts`**).
-   **`prefers-reduced-motion`**: niente mappa/camera/movimento/easter-egg — le zone diventano una **directory statica di pulsanti** ("VILLAGGIO DI STEFANO"), i pannelli si aprono al click e l'intro è stampata istantaneamente.

### 4. Web 1.0 / HTML Puro (≈1996)
**Componente:** `src/lib/themes/Web1.svelte`
-   **Home page personale GeoCities del 1996** incorniciata in una finestra **Netscape Navigator 3 "massimizzata"**: title bar con **throbber "N"** animato (meteora orbitante) + winbtns, menu bar `File Edit View Go…` (decorativa), **toolbar** `Back/Forward/Reload/Home/Images/Open/Print/Find/Stop` con bevel 3D (`Home` scrolla in cima, `Reload`/throbber riproducono il modem), location bar `http://www.geocities.com/SiliconValley/Heights/2600/…`, **status bar** con meteora di caricamento + testo scorrevole + `Document: Done`.
-   **Layout a tabelle** centrato (max 800px): colonna **Site Map** (bullet a pallina colorata, link interni con `scrollIntoView` per **non** sporcare l'hash dell'URL che porta il deep-link d'era) + colonna contenuti in **card a barra teal** (`#008080`). Tutti i contenuti da `cv-data.ts` (About, Esperienze, Skill, Formazione+Award+Conferenze, Cool Links, Contatti): **nessun dato inventato**, solo la cornice anni '96.
-   **Estetica:** sfondo **starfield** tassellato (notte blu, radial-gradient ripetuti), heading **rainbow** animato (`background-clip: text`), banner **`UNDER CONSTRUCTION`** a strisce hazard, **hit counter** odometer LCD verde (`0013337`), **6 badge 88×31** disegnati in CSS, **webring** widget, `<marquee>`/`<blink>`/`<hr>` 3D ricreati in CSS, bevel `outset/inset` ovunque (look Netscape/Win95). Tipografia di **sistema** (Times New Roman + Courier), `image-rendering` nativo, **nessun webfont**.
-   **Interazione / easter egg:** **guestbook funzionante** (form → nuova entry in lista + finto alert **`[JavaScript Application]`** con titlebar/icona/OK autentici); banner **"1.000.000° visitatore"** → stesso alert-gag; **throbber** → cue **modem 56k** (`web1Modem`); messaggi di stato a tema sui pulsanti della toolbar; **sparkle cursor trail** (solo pointer fine).
-   **`prefers-reduced-motion`:** marquee/blink/rainbow/comet/meteora/sparkle disattivati; i contenuti restano statici, leggibili e completamente accessibili (link/bottoni reali). **Mobile:** menu bar nascosta, toolbar a sole icone, tabella impilata in colonna singola.
-   Hash `#web1`, in `ERA_ORDER` **tra `pixel` e `winxp`**. Label d'anno **"1996"**, icona 🌐.

### 5. Windows XP (Inizio 2000)
**Componente:** `src/lib/themes/WinXP.svelte`
-   Replica minuziosa dell'ambiente desktop di Windows XP, completo dello sfondo **"Bliss" originale** (immagine reale), Taskbar, Menu Start e orologio funzionante.
-   **Wallpaper responsivo**: l'immagine viene servita nella risoluzione più adatta al viewport/DPI tramite media query (vedi *Asset & Performance*); il browser scarica solo il file corrispondente.
-   Sistema a finestre interattivo: i dati del curriculum sono organizzati in icone desktop (Cartelle, Documenti).
-   **Controlli finestra funzionanti** con icone SVG in stile XP: *Minimizza* (nasconde la finestra, resta nella Taskbar e si ripristina al click sul tab), *Ingrandisci/Ripristina* (occupa il desktop lasciando visibile la Taskbar; anche con doppio click sulla titlebar), *Chiudi*.
-   Supporto al *Drag & Drop*: Le finestre possono essere trascinate liberamente nello schermo grazie a un'azione Svelte personalizzata (`use:draggable`).
-   **Clippy** ingrandito e cartoonesco (SVG con graffetta metallica, occhi e sopracciglia animati): mostra un fumetto e, **al click, apre il client di posta** (`mailto:` con oggetto precompilato).
-   **Strategia mobile**: sotto i 600px il desktop si adatta — le finestre si aprono **massimizzate**, il drag libero è disabilitato (così nulla si perde fuori schermo) e il pulsante *Ingrandisci* è nascosto; menu Start, taskbar, icone e Clippy hanno layout compatto.
-   *Easter eggs:* un rapido multi-click sul desktop (o svuotando il cestino) innesca un finto Blue Screen of Death (BSOD), seguito da un **finto riavvio con la schermata di boot di XP** (logo + barra di caricamento animata) prima di tornare al desktop, chiudendo il cerchio narrativo.

### 6. Skeuomorfismo / Web 2.0 (≈2007-2013)
**Componente:** `src/lib/themes/Skeuo.svelte`
-   Era dei materiali del mondo reale e dei bottoni "gel" lucidi (iOS 6, Mac OS X, Aero): colma il salto estetico più brusco tra il desktop opaco di XP e il flat design del Bento.
-   **Superficie a scrivania**: sfondo in pelle scura cucita, con i contenuti disposti come oggetti fisici impilati.
-   **Materiali realistici**: targa in **metallo spazzolato** (con viti agli angoli e testo inciso/letterpress) per l'header; **blocco notes** giallo a righe con nastro adesivo per il sommario; pannello in **feltro verde** con chip "gel" per le competenze (raggruppate per `skillGroups`); agenda **rilegata in pelle** con cuciture per le esperienze; **diplomi incorniciati** su carta per l’istruzione; **gauge gel** lucidi per le lingue.
-   **Bottoni gel in stile App Store** per i contatti (LinkedIn/Email/Sito), con riflesso superiore e feedback tattile alla pressione (`:active` che affonda).
-   Tipografia di sistema (Georgia per i titoli incisi, Lucida Grande/Helvetica per il corpo): **nessun webfont aggiuntivo**.
-   Profondità sobria al passaggio del mouse riusando le action condivise `tilt`/`reveal` (entrambe rispettano `prefers-reduced-motion`).

### 7. Material Design / Flat (2014-2017)
**Componente:** `src/lib/themes/Material.svelte`
-   La "grande appiattita" tra Skeuomorfismo e Brutalismo: Google **Material Design** + iOS 7 cancellano texture e gradienti realistici. La profondità diventa un **sistema formale** — le ombre indicano l'**elevazione** (z-index), il movimento veicola significato. In `ERA_ORDER` è **tra `skeuo` e `brutalism`**, e racconta la reazione diretta allo skeuomorfismo che lo precede.
-   **App bar estesa** in gradiente **indaco** (`#3f51b5`→`#303f9f`, elevazione 4dp) con avatar circolare, nome (Roboto Medium), ruolo, tagline, *place-chip* della località e **icon-button** di contatto; **tab strip sticky** (Profilo · Esperienza · Competenze · Studi · Contatti) con **ink-bar accent (`#ff4081`) scorrevole** e **scroll-spy** (IntersectionObserver): click → scroll fluido alla sezione, scroll → tab attiva sincronizzata.
-   **Estetica:** contenuti su superficie `#fafafa` in **card flat bianche sollevate da ombre di elevazione** (token 2/4/6/8/12dp, che salgono a 8dp + `translateY` in hover). Esperienze con **avatar-monogramma** colorato (palette Material 500 a rotazione), period-chip, highlight con bullet a spunta accent e tech-chip; competenze in **chip tonali** (indaco chiaro); lingue come **LinearProgress determinato**; istruzione con icona *school*. Tutti i contenuti da `cv-data.ts`.
-   **FAB accent** circolare fisso (6dp→12dp in hover, azione primaria *mailto*) e **ripple** autentico (azione locale `ripple`: cerchio che si espande dal punto del tocco) su tab, icon-button, contatti e FAB.
-   Tipografia **Roboto** self-hostata (file variabile latin-subset). Hash `#material`, label d'anno **"2014"**, icona 📐, cue audio `case 'material'` (tap sine D5→B5).
-   **`prefers-reduced-motion`:** ripple soppresso, lift/scale e scroll fluido disattivati; le ombre di elevazione restano. **Mobile:** app bar centrata, tab strip scrollabile orizzontalmente, due-colonne impilate.
-   **Differenziazione da Bento:** Material = superfici **piatte + elevazione a ombre + ripple + ink-bar + accento forte**; Bento = modulare/widget, vetro smerigliato, bento-grid stondata.

### 8. Brutalismo (2017-2020)
**Componente:** `src/lib/themes/Brutalism.svelte`
-   Reazione cruda al minimalismo levigato: un CV "view-source" in stile **fanzine punk fotocopiata** incrociata con un terminale dati. Massima personalità, anti-design consapevole.
-   **Estetica:** carta da giornale calda (griglia a puntini "newsprint") + inchiostro nero, **bordi neri da 4px**, **ombre dure offset** (`8px 8px 0`, senza blur), zero `border-radius`. Accenti **sgargianti che si scontrano** (acid, cobalto, rosso, lime, pink) ruotati su tag, numeri di sezione e bottoni di contatto.
-   **Tipografia:** **Anton** (titoli display giganti), **Archivo** (corpo), **Space Mono** (meta-label, ticker, tag) — nessun font condiviso con le altre ere.
-   **Layout:** sezioni numerate (`01 / EXPERIENCE`), tipografia che sfonda la griglia, **ticker monospace** scorrevole sticky in alto, esperienze in accordion a toggle secco.
-   **Micro-interazioni (sotto `prefers-reduced-motion`):** hover **tattili** che "schiacciano" l'ombra (translate netto, easing lineare), tag che **invertono** secco nero/carta, glitch ad aberrazione cromatica sul nome, `● location` lampeggiante. Audio: buzzer ruvido dissonante.
-   *Nota cronologica:* collocato in `ERA_ORDER` **prima di Bento** (il Brutalismo 2017 precede l'esplosione del Bento 2021+).

### 9. Modern Flat / Bento Box (2015-Oggi)
**Componente:** `src/lib/themes/BentoBox.svelte`
-   Design basato sul layout asimmetrico "Bento Grid" tramite CSS Grid (con `grid-template-areas` per un layout bilanciato e senza buchi), molto in voga nei portafogli moderni (es. stile Apple).
-   Tipografia curata (**Space Grotesk** per titoli/nomi, **Inter** per il corpo), label di sezione in maiuscoletto, avatar con anello a gradiente conico, ombre morbide a due livelli e palette indaco armonizzata.
-   Animazioni di ingresso `in:fly` "staggered" per un effetto a comparsa fluido degli elementi.
-   Banner a scorrimento infinito (Marquee CSS) per lo stack tecnologico.
-   **Toggle Light/Dark Mode** come pulsante circolare compatto fisso in alto a destra. La preferenza è persistita (`cv_bento_dark`) e inizializzata da `prefers-color-scheme`; il passaggio usa una **View Transition circolare** (clip-path che si espande dal punto del bottone), con fallback morbido dove l'API non è supportata o con `prefers-reduced-motion`.

### 10. Glassmorphism (2020 - il presente luminoso)
**Componente:** `src/lib/themes/Glass.svelte`
-   Il **presente luminoso** dei sistemi operativi (macOS Big Sur, Windows 11 Acrylic, iOS/visionOS): superfici di vetro traslucido su sfondi sfocati e luminosi. In `ERA_ORDER` è **tra `bento` e `threed`**, come tappa che precede il salto immersivo nel 3D.
-   **Differenziazione dal 3D/Futuro — "Luce vs Buio"** (è il discriminante portante): Glass = **chiaro/pastello/arioso**, **nessun WebGL**; il 3D = scuro/neon/sci-fi con scena WebGL. Pur condividendo il vocabolario del vetro (`backdrop-filter: blur`), i due sono opposti per luminosità, sfondo e tipografia.
-   **Sfondo:** campo di 5 **aurora-blobs pastello** (aqua/lilla/pesca/cielo/menta) su base quasi-bianca, sfocati (`blur(70px)`) e in **drift CSS lento**, con **parallax 2D piatto** (l'intero campo scivola di pochi px verso il cursore via `--px/--py` aggiornati su `mousemove` — niente camera/prospettiva). Tutto puro CSS, zero canvas.
-   **Vetro frosted presente e lattiginoso:** pannelli `rgba(255,255,255,.45)` + `backdrop-filter: blur(30px) saturate(180%)`, **bordo-luce 1px** in alto (inset highlight), ombra ambient diffusa; **sheen speculare** bianco che segue il cursore (via action `tilt` → `::after` con `mix-blend-mode: overlay`). Molto più presente del vetro quasi invisibile del 3D.
-   **Layout** a griglia di pannelli frosted fluttuanti (hero a tutta larghezza → Profilo → Esperienza → Competenze/Lingue → Formazione/Conferenze), arioso, scrollabile; mobile a colonna singola. Contenuti **tutti da `cv-data.ts`**, ingresso con `use:reveal` + tilt con `use:tilt`.
-   Tipografia **Outfit ultralight** (nome a peso 200; geometrico arioso, variable self-hostato `~34KB`) — la voce SF/Big Sur, opposta all'Orbitron sci-fi del 3D. Hash `#glass`, label d'anno **"2020"**, icona 🧊, cue audio `case 'glass'` (**campanella di vetro**: arpeggio triangle E5·B5·E6 + halo sine acuto). Tutto gated da `prefers-reduced-motion` (drift dei blob, parallax e sheen disattivati; vetro e contenuti restano).

### 11. Il Futuro - 3D Immersivo (2026+)
**Componente:** `src/lib/themes/ThreeD.svelte`
-   Tema sperimentale volto a mostrare skill avanzate e padronanza WebGL.
-   Scena **Three.js** elaborata a piena pagina (canvas `fixed`, copre tutto a qualsiasi dimensione): **nebulosa di particelle** a 3 strati con dot luminosi rotondi (texture radiale generata su canvas, additive blending), un **torus knot** wireframe centrale rotante e pulsante, **anelli di energia** orbitanti e solidi (icosaedro/ottaedro) che ruotano e oscillano. Parallasse della camera legata al movimento del mouse.
-   **Lazy-load di Three.js**: la libreria (~150KB) e i suoi add-on di post-processing sono importati dinamicamente (`await import('three')`) solo all'ingresso in questa era, così chi resta su Bento/Terminale non li scarica. Il canvas fa un fade-in elegante da nero al primo frame renderizzato.
-   **Bloom reale (post-processing)**: pipeline `EffectComposer` + `UnrealBloomPass` per un glow vero su dot e torus knot. È *gated*: attivo solo su viewport ampi e con motion consentito, con fallback al rendering diretto.
-   **Scena reattiva**: l'hover sulle card inietta "energia" nella scena (decade nel tempo) che accelera il drift, intensifica il bloom e scalda l'hue del torus knot → sensazione di sistema vivo.
-   **Performance**: il loop `requestAnimationFrame` viene messo in pausa quando il tab è nascosto (`visibilitychange`); cleanup completo (dispose di renderer/composer) all'uscita.
-   Tipografia futuristica: **Orbitron** per i titoli display, **Space Grotesk** per il resto.
-   Veste grafica in *Glassmorphism scuro*: blocchi semitrasparenti (`backdrop-filter: blur`) appena percettibili sopra la scena WebGL, luci neon su background profondissimo, con vignetta per la leggibilità. È la veste neon/scura — distinta dall'era Glassmorphism autonoma (n.10), chiara e senza WebGL.
-   Effetto "Tilt" 3D contenuto: le carte, grazie alla matematica basata sulla posizione del cursore (`mousemove`), ruotano leggermente orientandosi verso il mouse.

---

### 12. Parallax / Immersive Scroll (≈2018)
**Componente:** `src/lib/themes/Parallax.svelte`
-   Il **web premium "craft"** contemporaneo (stile *synthesis.capital* / *tresmarescapital.com*): il sito diventa un'**esperienza cinematografica da scrollare**. L'**estetica è la protagonista**, i contenuti sono un **sottoinsieme curato** di `cv-data.ts` (formazione/conferenze/lingue restano nelle altre ere). In `ERA_ORDER` è **tra `brutalism` e `glass`** (cronologicamente ~2018, appena prima del presente luminoso). Hash `#parallax`, label d'anno **"2018"**, icona 🎬.
-   **Smooth-scroll con inerzia** via **Lenis** (~3KB) caricato **lazy** solo entrando nell'era (come Three nel 3D), unica dipendenza runtime oltre a Three; spento sotto `prefers-reduced-motion`. Lo scroll è interno a un wrapper dedicato (il `body` resta `overflow:hidden`).
-   **Parallax multi-piano** (layer a velocità diverse guidati da `scrollY`, in un handler rAF-throttled su offset cachati) e **reveal coreografati**: nome/manifesto a **parole mascherate** che salgono da dietro un overflow, **righe esperienza che entrano alternando lato** (pari da sinistra, dispari da destra), statement con parole-chiave evidenziate in terracotta.
-   **7 scene**: hero (**composizione astratta animata** — anelli orbitali concentrici, diamante rotante, orb pulsante, dot alla deriva, "+" che luccicano, su più piani di parallax), profilo-manifesto, **percorso** (index editoriale, hover → micro-dettaglio), **numeri in cifre** (sezione *pinned* con **contatori animati** derivati da `cv-data.ts`: anni dal 2011 = 15, aziende = 5, tecnologie = 24), **competenze** (keyword-wall **cinetica/marquee** a righe contrapposte), **ritratto** (avatar in **duotone** + parallax), **CTA** (bottoni **magnetici** + contatti reali).
-   **Tipografia**: serif display **Fraunces** self-hostato per gli statement + **Inter** per il corpo. Inoltre: **cursore custom** (dot + ring con lag), barra di **progresso** scroll, **indice a puntini** cliccabili (scroll fluido), **auto-scroll "▶ Play"** opzionale (pausabile al primo input, nascosto sotto reduced-motion).
-   **Doppio binario / `prefers-reduced-motion`** (il difetto d'epoca — motion-sickness — risolto): niente Lenis/parallax/auto-scroll/cursore/marquee → **scroll verticale statico** elegante, reveal a sola opacità, marquee sostituito da una **lista skill accessibile**, sezioni *pinned* sbloccate. Contenuti **sempre integri e raggiungibili**. Cue audio (`case 'parallax'`): **swell aereo/pad ambient** ascendente (≠ campanella del Glass, ≠ drone del 3D).

## Il Componente Timeline
**Componente:** `src/lib/components/Timeline.svelte`
La linea del tempo posizionata in basso (a forma di "pillola di vetro" espandibile) è l'elemento che unisce l'intero progetto. È progettato per essere reattivo e per iniettare CSS globale (`:global`) in base al tema selezionato, così da mimetizzarsi e rispettare i canoni visivi dell'era attiva: diventa un blocco nero e verde monospace nel Terminale, una dialog-box NES indaco con bordo bianco e nodo attivo rosso (font **Press Start 2P**) nella Pixel Art, una pillola **grigio-argento `#c0c0c0` con bevel `outset` (look Netscape/Win95)** e nodo attivo blu navy in Times nel Web 1.0, una barra opaca outset in Windows XP, una pillola in **metallo spazzolato** con nodo attivo "gel" blu nello Skeuomorfismo, una **superficie bianca flat sollevata da ombre di elevazione** con nodo attivo indaco, font **Roboto** e fill indaco→accent nel Material Design, un blocco squadrato a bordo nero spesso con nodo attivo acid-yellow e font **Space Mono** nel Brutalismo, una pillola con font **Space Grotesk** in Modern Flat, una **pillola frosted lattiginosa** (vetro `backdrop-filter: blur+saturate`, bordo-luce, nodo attivo viola, font **Inter**) nel Glassmorphism, una **pillola crema editoriale** con nodo attivo **olive** e font Inter nel Parallax, e una versione neon con font **Orbitron** nel Futuro.

## Asset & Performance
-   **Wallpaper XP**: in `static/wallpapers/` sono presenti 4 risoluzioni del "Bliss" originale (`bliss-1366x768`, `bliss-1920x1080`, `bliss-2560x1440`, `bliss-3840x2160`). La selezione avviene via media query (`min-width` + `min-resolution` per i display HiDPI/retina): viene scaricato **solo** il file che corrisponde al dispositivo.
-   **Font**: caricate solo 4 famiglie Google Fonts con i pesi strettamente necessari e `display=swap`; il browser scarica i `woff2` solo del tema visualizzato.
-   **WebGL**: `pixelRatio` limitato (max 1.75), numero di particelle ridotto e dimezzato automaticamente quando è attivo `prefers-reduced-motion` (che ferma anche le animazioni di moto).
-   **Transizioni**: il cross-dissolve tra temi rispetta `prefers-reduced-motion`.

## Esecuzione e Compilazione
Il progetto è uno stack SvelteKit standard. Per interagire e sviluppare:

-   `npm run dev` per avviare l'ambiente di sviluppo.
-   `npm run build` per generare gli asset e i bundle di produzione ottimizzati.
