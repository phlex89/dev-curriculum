# Le Ere — catalogo stilistico & contestuale

> Documento di riferimento per il concetto "Time-Machine Resume": ogni "era" è una
> tappa nella storia della UI/UX del web/desktop. Qui sono catalogate **sia le ere già
> implementate** sia le **proposte** non ancora realizzate, ciascuna con la sua identità
> visiva e il suo contesto storico-narrativo.
>
> **Legenda stato:**
> `✅ Implementato` · `🟡 Parziale / unito ad altro concept` · `⬜ Proposta (non implementata)`
>
> **Regola d'oro** (vedi `MIGLIORAMENTI.md` §1): *fedeltà d'epoca*. Ogni era deve essere
> **credibile rispetto al periodo che evoca**, mai anacronisticamente "moderna".
>
> **Vincoli architetturali** (vedi `CLAUDE.md` / `AGENTS.md`):
> - Contenuti dalla **fonte di verità unica** `src/lib/cv-data.ts` — mai duplicare testi.
> - Ogni era è un **componente Svelte isolato** in `src/lib/themes/` con CSS proprio.
> - Nuove ere vanno aggiunte a `Theme`/`THEMES`/`ERA_ORDER` in `src/lib/store.ts`,
>   al deep-link hash, all'audio d'epoca (`src/lib/audio.ts`) e allo stile per-tema
>   della Timeline (`src/lib/components/Timeline.svelte`).
> - Ogni animazione passa dal filtro `prefers-reduced-motion`.

> **Deroghe di contrasto documentate** (baseline WCAG AA, vedi `PRODUCT.md`). Dove la
> fedeltà d'epoca lo impone, il contrasto può scendere sotto AA — ma solo come scelta
> consapevole, elencata qui:
> - **Windows XP** — i pulsanti di titlebar (min/max/chiudi ~21px) e il testo della
>   taskbar riproducono le misure e i colori reali di Luna: ingrandirli o scurirli
>   romperebbe il chrome. Deroga voluta sulle *chrome*, non sui contenuti del CV.
> - **Pixel Art** — Press Start 2P è un font a blocchi: il corpo del dialogo NES ha un
>   **pavimento di leggibilità di `0.56rem`** (alzato dai ~7px originari). Andare oltre
>   sfonderebbe il riquadro; sotto quel valore no.
> - **Televideo** — il blu puro `#00f` è alzato a `#6c7bff` per superare AA su nero.
>
> Tutto ciò che **non** è in questo elenco deve rispettare AA (testo normale ≥4.5:1).

---

## Quadro d'insieme

| # | Era | Periodo | Stato | Componente |
|---|-----|---------|-------|------------|
| 1 | Terminale Unix / MS-DOS | Anni '80 – primi '90 | ✅ Implementato | `Terminal.svelte` |
| 2 | Pixel Art / 8-bit Console Gaming | metà anni '80 – metà '90 | ✅ Implementato | `PixelArt.svelte` |
| 3 | Web 1.0 / HTML Puro | Metà anni '90 | ✅ Implementato | `Web1.svelte` |
| 4 | Windows 9x / XP Desktop | Inizio anni 2000 | ✅ Implementato | `WinXP.svelte` |
| 5 | Glossy / Skeuomorfismo (Web 2.0) | ca. 2007–2013 | ✅ Implementato | `Skeuo.svelte` |
| 6 | Material Design & Flat | 2014–2017 | ✅ Implementato | `Material.svelte` |
| 7 | Neubrutalism | 2021 | ✅ Implementato | `Brutalism.svelte` |
| 8 | Bento Box | 2022 | ✅ Implementato | `BentoBox.svelte` |
| 9 | Glassmorphism | 2020 (il presente luminoso) | ✅ Implementato | `Glass.svelte` |
| 10 | WebGL immersivo (Awwwards) | 2019 | ✅ Implementato | `ThreeD.svelte` |
| 11 | AI / Conversazionale | 2030+ (oltre il 3D) | ⬜ Proposta | — (da creare) |
| 12 | Y2K / Chrome & Plastica translucida | 2000 | ✅ Implementata | `Y2K.svelte` (`'y2k'`, `#y2k`) |
| 13 | Teletext / Televideo (Mode 7) | anni '70 – 2000 | ✅ Implementato | `Teletext.svelte` |
| 14 | Neumorphism / Soft UI | 2020 | ⬜ Proposta (valutata) | — (da creare) |
| 15 | Parallax / Immersive Scroll | ~2018–oggi (apice premium) | ✅ Implementata | `Parallax.svelte` (`'parallax'`, `#parallax`) |
| 16 | Liquid Glass | 2025 | ✅ Implementata | `Liquid.svelte` (`'liquid'`, `#liquid`) |

> Le proposte **§12–§15** sono state *valutate* (giu 2026) come prossimi candidati
> memorabili: ognuna ha contesto, stile e rischio-sovrapposizione documentati. Le idee a
> più basso valore o più a rischio di sovrapposizione (Frutiger Aero, Vaporwave, PS1
> low-poly, Amiga, Mac Classic) restano in **"Idee oltre la lista"** come spunti/easter-egg.

> L'attuale `ERA_ORDER` (rivisto a set 2026, vedi `ANALISI-STILI.md`) è
> `['terminal', 'teletext', 'pixel', 'web1', 'y2k', 'winxp', 'skeuo', 'material', 'parallax', 'threed', 'glass', 'brutalism', 'bento', 'liquid']`.
> Terminale, Televideo e Pixel Art sono lineage parallele degli anni '80; il **Web 1.0** (1996)
> e il web Flash **Y2K** (2000) precedono il desktop **XP** (2001); **Skeuo** (2010) e **Material** (2014) raccontano la "grande
> appiattita"; il **Parallax** (2018) apre il craft web premium; il **WebGL** (2019, prima "Future 3D · 2026") racconta i portfolio immersivi da Awwwards; seguono **Glass** (2020),
> **Neubrutalism** (2021, prima etichettato per errore "Brutalism · 2017"), **Bento** (2022,
> prima "Modern Flat · 2015") e **Liquid** (2025), che oggi chiude la timeline. Il nuovo finale previsto è l'**era AI**
> (§11), dopo `liquid`.

---

## 1. Terminale Unix / MS-DOS — ✅ Implementato
**Anni '80 – primi '90** · `src/lib/themes/Terminal.svelte`

**Contesto.** L'alba dell'informatica personale e professionale: nessuna metafora
visiva, solo testo. Il computer si guida a comandi; la competenza è saper *digitare*
la cosa giusta. Punto di partenza cronologico del viaggio.

**Stile.**
- **Palette:** schermo nero, fosfori **verdi** (variante ambra possibile), un solo colore.
- **Tipografia:** monospace (**JetBrains Mono**), cursore a blocco lampeggiante `▋`.
- **Texture:** scanlines CRT, glow da fosforo, pattern a puntini/linee verdi sullo sfondo.
- **Layout:** flusso testuale verticale, prompt + output, nessun "chrome" grafico.

**Interazione / narrativa.** Riga di comando reale: `ls`, `cat about.txt`, `show exp 1`,
`neofetch`, storia comandi ↑/↓, autocomplete `Tab`, boot sequence BIOS/POST. Quick
Actions per chi non vuole digitare. Easter egg `matrix`, `sudo`.

---

## 2. Pixel Art / 8-bit Console Gaming — ✅ Implementato
**metà anni '80 – metà anni '90** (era 8/16-bit, NES → SNES) · `src/lib/themes/PixelArt.svelte`

> **Stato implementazione.** Realizzato come da concept: overworld top-down a tile
> (48×32) in DOM/CSS, camera che segue l'eroe (sprite a 4 direzioni con walk-cycle,
> tutto CSS originale), sei zone-edificio → `cv-data.ts`, dialog box NES con intro
> typewriter, HUD con quest log `★ n/6` e `QUEST COMPLETE` + fanfara. **Doppio
> binario**: edifici cliccabili + directory "MOSTRA TUTTO". Sotto
> `prefers-reduced-motion` il gioco è sostituito da una **directory statica di
> pulsanti** (nessun movimento/camera). Font *Press Start 2P*, hash `#pixel`,
> `ERA_ORDER` subito dopo `terminal`. La scheda sotto resta come documentazione del concept.
>
> **Rifinitura (2026-06).** Il villaggio è stato riorganizzato come **viaggio
> sinistra→destra**: le sei zone seguono l'**ordine narrativo del CV**
> (Casa → Castello → Bottega → Biblioteca → Posta → Scrigno), alternate in alto/basso,
> collegate da una **strada serpeggiante unica** (waypoint con segmenti orto­gonali,
> non in linea retta). **Densità pixel raddoppiata** (`--px = tile/16`, prima `tile/8`):
> tile più dettagliati (erba a ciuffi, sentiero in terra battuta con bordo e ciottoli,
> acqua a bande con increspature, alberi con tronco+chioma), **edifici ridisegnati**
> (casa con comignolo, castello a due torri + merlature + portcullis, bottega con
> tendone a righe e insegna, biblioteca a colonne + frontone, cassetta postale, scrigno
> a bande dorate) e **sprite eroe più curato**. **Invio** chiude il dialog (prima
> avanza il typewriter, poi chiude); `Esc` chiude sempre.
>
> **Rifinitura (2026-07).** **Griglia di gioco raddoppiata**: mappa 24×16 → **48×32**
> con tile dimezzati (il viewport mostra il doppio dei quadratini), strada larga 2 tile,
> laghetto 6×6, collisioni/interazioni/monete a **blocco 2×2**. Gli **sprite mantengono
> la dimensione assoluta** — il terreno segue la griglia fine (`--px = tile/32`), mentre
> eroe/edifici/monete/segnaletica usano l'override `--px = tile/16` — e guadagnano
> **dettaglio a mezzo pixel**: eroe con stivali, fibbia, ombreggiatura laterale e
> highlight negli occhi; finestre con croce, merli e feritoie, tendone con frangia,
> increspature sull'acqua, ciottoli sul sentiero. Movimento più rapido e fluido
> (`STEP_MS` 150→50 su passi dimezzati, transizioni CSS sincronizzate via custom
> property `--step`); typewriter dei dialoghi a 13ms/carattere.
>
> **Easter egg.**
> - **Konami Code** (`↑↑↓↓←→←→ B A`) → toggle **modalità notte** (overlay blu + stelle) +
>   fanfara + toast.
> - **Bump**: sbattere contro ostacoli → micro-shake direzionale + suono `pixelBump`
>   (l'eroe è posizionato via `--hx/--hy` così l'animazione non rompe centraggio/flip).
> - **Idle**: dopo ~4,5s fermo, "Z" fluttuante sopra l'eroe.
> - **Pesca**: di fronte all'acqua appare il prompt `🎣 F`; premendo **F/Spazio** si pesca
>   un oggetto random (battute chiptune).
> - **Monete → zona segreta**: 6 monete sulla strada (HUD `● n/6`); raccolte tutte
>   compare la **PERGAMENA** centrale (7ª zona bonus, non conta nel quest `★ n/6`) con una
>   **"Scheda Eroe" RPG** di statistiche **derivate da `cv-data.ts`** (nessun contenuto
>   inventato).
>
> Tutti gli easter egg sono gated da `prefers-reduced-motion`. Audio chiptune in
> `audio.ts`: `pixel` cue + `pixelBlip`/`pixelDiscover`/`pixelFanfare` +
> `pixelCoin`/`pixelBump`/`pixelSecret`.

**Contesto.** Mentre i computer "parlavano" per comandi testuali (vedi era 1), nelle
case di mezzo mondo esplodeva il **mondo delle console**: Nintendo (NES, poi Super
Nintendo), Sega. La grafica è fatta di **pixel grossi e visibili**, palette
ridottissime imposte dall'hardware, **sprite e tile** 8×8/16×16. È l'estetica ludica
per eccellenza, **nostalgia pura** e personalità altissima. Cronologicamente è gemella
del Terminale, ma è una *lineage parallela* — non il PC professionale bensì il
divertimento da salotto. Nel viaggio funziona come **detour giocoso** subito dopo il
prompt monocromatico: dal verde fosforo ai colori saturi dell'overworld.

> **Concept scelto: mini-gioco top-down (RPG overworld) esplorabile**, stile *Zelda /
> Pokémon / RPG 8-bit* — **non** un platformer side-scroll. Motivazione: la vista
> dall'alto rende la navigazione **perdonante** (cammini, nessun timing/abilità),
> mappa in modo naturale "zona = sezione del CV" ed è perfettamente accessibile (il
> *tap/click su una zona* fa da fallback e da "modalità leggi-tutto"). Niente accesso ai
> contenuti legato a un'abilità di gioco → coerente con la regola *"nessun vicolo cieco"*.

**Stile.**
- **Palette:** colori **NES limitati e saturi**, niente gradienti, solo blocchi flat —
  erba/prato (`#00A800`/`#008000`), terra/sentiero (`#C84C0C`), acqua (`#5C94FC`),
  giallo monete/scintille (`#FCD800`), bianco UI, rosso eroe (`#D82800`). Poche tinte
  per "schermata", come un vero chip grafico.
- **Tipografia:** font **bitmap/pixel** — **"Press Start 2P"** (Google Fonts) per
  titoli, HUD e dialog box, dimensioni a **multipli interi** della griglia, **zero
  anti-aliasing**.
- **Materiali / rendering:** `image-rendering: pixelated` ovunque; **edge duri**,
  nessun `border-radius` reale (gli angoli "stondati" si fanno a **gradini di pixel**);
  **ombre a blocchi** (drop-shadow pixelata in offset, **niente blur**); **dialog box**
  bordata stile NES (cornice a doppio pixel chiaro/scuro, fondo scuro semitrasparente).
- **Layout:** **mappa overworld a tile vista dall'alto** che scrolla, con **camera che
  segue il personaggio**. Zone/edifici etichettati sparsi sulla mappa (vedi tabella),
  sentieri che li collegano, ostacoli (alberi, acqua, recinti) come tile non calpestabili.
  **HUD minimale in alto**: titolo zona corrente + **quest log** "Zone esplorate `n/N`".

**Interazione / narrativa.** Il CV come **piccolo mondo da esplorare**: ogni sezione è
una **zona/edificio**, raggiungerla apre il pannello informativo. Personaggio sprite a
**4 direzioni** mosso con **frecce/WASD**, camera che segue; avvicinandosi a una zona
parte un **dialog box stile NES** che sale dal basso, con testo "stampato" carattere per
carattere (riuso del pattern typewriter del Terminale). Mappa zone → `cv-data.ts`:

| Zona (sprite, asset originale) | Sezione CV |
|---|---|
| 🏠 Casa | About / profilo |
| 🏰 Castello / torre a piani | Esperienze (un piano/stanza = un lavoro) |
| 🛒 Bottega / inventario | Skills (raccolte come "power-up") |
| 📜 Biblioteca | Formazione |
| ✉️ Cassetta postale / cabina | Contatti & social |
| 🧰 Scrigno | Download CV (PDF) |
| 🔮 Pergamena (zona bonus, sbloccata dalle monete) | "Scheda Eroe" RPG (statistiche derivate dal CV) |

> Le zone sono disposte in **ordine narrativo da sinistra a destra** lungo una strada
> serpeggiante; la Pergamena è un easter egg centrale che appare solo dopo aver raccolto
> tutte e 6 le monete.

- **Touch / click**: *tap-to-move* (tocchi una zona → il personaggio ci cammina) **oppure**
  click diretto sulla zona che apre subito il pannello — stesso gesto = fallback mobile e
  "leggi-tutto". Pathfinding banale (tile bloccate + lerp/step a griglia, niente A*).
- **Quest / progress** opzionale: visitando tutte le zone → schermata **`QUEST COMPLETE`**
  che sblocca il download del CV (lo scrigno). Dà un motivo a esplorare senza penalizzare
  chi clicca soltanto.
- Transizioni d'era: **fade pixelato / "dithering"** entrando, schermata nera con esito
  uscendo.

**Audio d'epoca.** Chiptune **square/triangle wave** — passi del personaggio, **blip**
del dialogo, jingle "zona scoperta" e fanfara `QUEST COMPLETE`. Coerente con la Web Audio
API già usata in `audio.ts`.

**Note implementative.**
- **Tutto in DOM/CSS quando possibile** (tile come box + `image-rendering: pixelated`,
  personaggio sprite via `background-position`/steps) per restare leggeri; eventuale
  `<canvas>` **solo** per la mappa/scroll se i tile diventano troppi. **Niente game engine.**
- **Design a griglia di pixel/tile** (es. tile logico 16×16, 1px logico = 3–4px schermo)
  con snap alla griglia; collisioni su una matrice di tile calpestabili/non.
- **Movimento gated da `prefers-reduced-motion`**: in reduced-motion la mappa è **statica**,
  le zone diventano **pulsanti** e i pannelli si aprono al click; nessuno scroll/camera.
- **Nessun vicolo cieco / doppio binario sempre attivo**: i contenuti sono **sempre**
  raggiungibili anche senza "giocare" (click diretto sulla zona + tasto/lista "mostra
  tutto"). La leggibilità per il recruiter viene prima del gameplay.
- **Mobile**: D-pad on-screen opzionale **oppure** solo tap-to-move/tap-zona; camera e
  dimensioni tile adattate al viewport.
- **Copyright**: **mai** sprite o tileset Nintendo reali. Creare **asset originali
  "ispirati"** all'8/16-bit (eroe generico, edifici, monete/scintille generiche).

**Identificatori tecnici previsti (per l'implementazione).**
- `Theme` key: **`'pixel'`** · componente **`src/lib/themes/PixelArt.svelte`**.
- Deep-link hash: **`#pixel`**.
- `ERA_ORDER`: inserire **subito dopo `terminal`** → `['terminal', 'pixel', 'winxp', …]`.
- Registrare in `Theme`/`THEMES`/`ERA_ORDER` (`store.ts`), aggiungere il jingle chiptune
  in `audio.ts` e lo stile per-tema in `Timeline.svelte`. Label d'anno suggerita: **"1988"**.
- Webfont **"Press Start 2P"** via Google Fonts.

---

## 3. Web 1.0 / HTML Puro — ✅ Implementato
**Metà anni '90** · `src/lib/themes/Web1.svelte`

> **Stato implementazione.** Realizzato come **home page personale GeoCities del 1996
> incorniciata in una finestra Netscape Navigator 3 "massimizzata"**. Chrome completo
> (title bar con **throbber "N"** animato + meteora, menu bar `File Edit View Go…`,
> toolbar `Back/Forward/Reload/Home/Images/Open/Print/Find/Stop` con bevel 3D, location
> bar `http://www.geocities.com/SiliconValley/Heights/2600/…`, **status bar** con
> meteora di caricamento + testo scorrevole + `Document: Done`). Pagina a **layout di
> tabelle** centrato (max 800px) con colonna **Site Map** (bullet a pallina colorata)
> + colonna contenuti in **card a barra teal** (`#008080`). Tutti i contenuti da
> `cv-data.ts` (About, Esperienze, Skill, Formazione+Award+Conferenze, Cool Links,
> Contatti) — **nessun dato inventato**, solo la cornice anni '96. Tipografia di
> **sistema** (Times New Roman + Courier per i meta): **nessun webfont**. Hash `#web1`,
> in `ERA_ORDER` **tra `pixel` e `winxp`**. Label d'anno **"1996"**.
>
> **Dettagli d'epoca (CSS originale):** sfondo **starfield** tassellato (notte blu),
> heading **rainbow** animato, banner **`UNDER CONSTRUCTION`** a strisce hazard, **hit
> counter** odometer LCD (`0013337`), **6 badge 88×31** ("Netscape Now!", "Made with
> Notepad", "HTML 3.2 Checked!", "Best viewed 800×600", "Lynx Enhanced", "Y2K Ready"),
> **webring** widget, `<marquee>` e `<blink>` ricreati in CSS, `<hr>` 3D groove,
> footer "Made with Notepad on a Pentium 133MHz · best viewed in Netscape 3.0".
>
> **Interazione / easter egg:** **guestbook funzionante** (form → nuova entry + finto
> alert **`[JavaScript Application]`**); banner **"1.000.000° visitatore"** → stesso
> alert-gag; **throbber Netscape** → cue **modem 56k dial-up** (sintetizzato in
> `audio.ts`, `web1Modem()` + `case 'web1'` di `playEra`); toolbar con messaggi di
> stato a tema; **sparkle cursor trail** (solo pointer fine). **Tutto gated da
> `prefers-reduced-motion`** (marquee/blink/rainbow/comet/meteora/sparkle disattivati;
> i contenuti restano statici e leggibili). Mobile: menu bar nascosta, toolbar a sole
> icone, tabella impilata. La scheda sotto resta come documentazione del concept.

**Contesto.** L'alba di internet di massa: GeoCities, Angelfire, le prime home page
personali. HTML senza CSS, documenti più che applicazioni. È il salto narrativo tra la
console e il desktop: il PC esce di casa e si connette al mondo. Colma **il buco più
ampio della timeline** (tra Pixel/Terminale e XP).

**Stile** *(scelte effettive in implementazione).*
- **Palette:** **starfield tassellato** notte-blu (`#00001e` + radial-gradient di stelle)
  come sfondo del body/area-contenuto, **card a fondo crema** (`#fffdf2`) per la
  leggibilità; chrome Netscape grigio-argento (`#c0c0c0`, bevel `outset/inset`); link
  **blu** non visitati (`#0000ee`) / **viola** visitati (`#551a8b`); barre sezione e
  accenti in **teal** (`#008080`), navy (`#000080`), maroon (`#800000`), hazard giallo/nero.
- **Tipografia:** **Times New Roman** di sistema (corpo/titoli), **Courier** per i meta e
  l'odometer, **Arial** per il chrome del browser — **nessun webfont**.
- **Elementi d'epoca:** `<marquee>` scorrevole, `<blink>`, **hit counter** odometer,
  banner "Under Construction", **badge 88×31** ("Best viewed in Netscape" & co.), righello
  `<hr>` 3D, **webring**, liste puntate con bullet a pallina colorata, **tabelle per il layout**.
- **Layout:** pagina **centrata** (max 800px) a **tabella a due colonne** — colonna *Site
  Map* a sinistra + colonna contenuti (card con barra-titolo teal) a destra — il tutto
  dentro la finestra **Netscape Navigator 3** "massimizzata" (title/menu/tool/location/status bar).

**Interazione / narrativa.** Niente JS moderno percepibile: link interni che "saltano"
alle sezioni (via `scrollIntoView`, senza sporcare l'hash d'era), "Last updated",
**guestbook funzionante** (gag con finto alert `[JavaScript Application]`), banner
"1.000.000° visitatore", **throbber Netscape** che "compone" il modem, **sparkle cursor
trail**. Tutto deve sembrare servito da un server statico del 1996.

**Note implementative.** `<marquee>`/`<blink>` (deprecati) **ricreati in CSS** e gated da
`prefers-reduced-motion` (in reduced-motion marquee/blink/rainbow/comet/meteora/sparkle
sono disattivati e i contenuti restano statici e leggibili). Link/bottoni **reali** per
l'accessibilità; mobile con chrome collassato (menu bar nascosta, toolbar a sole icone,
tabella impilata). Audio: cue **modem 56k** in `audio.ts` (`web1Modem` / `case 'web1'`).

---

## 4. Windows 9x / XP Desktop — ✅ Implementato
**Inizio anni 2000** · `src/lib/themes/WinXP.svelte`

**Contesto.** Il PC è ormai un elettrodomestico. La metafora della scrivania trionfa:
finestre, icone, taskbar, menu Start. L'interazione passa per un finto sistema operativo.

**Stile.**
- **Palette:** verde "Bliss", blu Luna della taskbar/titlebar, grigi delle finestre.
- **Tipografia:** Tahoma/Segoe UI di sistema (font autentico, nessun webfont).
- **Materiali:** bordi bombati/outset, gradienti Luna, ombre nette, icone SVG stile XP.
- **Layout:** desktop con icone, finestre modali trascinabili, taskbar + tray + orologio.

**Interazione / narrativa.** Sistema a finestre completo (minimizza/ingrandisci/chiudi,
doppio click per aprire, drag vincolato al viewport, mobile = finestre massimizzate).
Clippy che apre il client mail. Easter egg: BSOD → finto riavvio con boot screen XP.

---

## 5. Glossy / Skeuomorfismo (Web 2.0) — ✅ Implementato
**ca. 2007–2013** · `src/lib/themes/Skeuo.svelte`

**Contesto.** Web 2.0, iPhone, iOS 6, Mac OS X Aqua. Il digitale imita il mondo reale per
rassicurare: bottoni che sembrano premibili, materiali tangibili. Colma il salto estetico
più brusco, tra il desktop opaco di XP e il flat design.

**Stile.**
- **Palette:** ricca, materica; legno, pelle, metallo, feltro verde, carta.
- **Tipografia:** Georgia (titoli incisi/letterpress), Lucida Grande/Helvetica (corpo).
- **Materiali:** targa in metallo spazzolato con viti, blocco notes giallo con nastro
  adesivo, feltro con chip "gel", agenda rilegata in pelle con cuciture, diplomi
  incorniciati, gauge gel lucidi, bottoni gel stile App Store con riflesso.
- **Layout:** "scrivania" con oggetti fisici impilati, ombre realistiche profonde.

**Interazione / narrativa.** Feedback tattile (`:active` che affonda), tilt/reveal soft.
Gli oggetti sembrano poggiati su una superficie in pelle cucita.

---

## 6. Material Design & Flat — ✅ Implementato
**2014–2017** · `src/lib/themes/Material.svelte`

> **Stato implementazione.** Realizzato come **scheda prodotto Material Design 2014–2017**.
> **App bar estesa** in gradiente indaco (`#3f51b5`→`#303f9f`, elevazione 4dp) con avatar
> circolare, nome (Roboto Medium), ruolo, tagline, *place-chip* della località e icon-button
> di contatto. **Tab strip sticky** sotto l'app bar (Profilo · Esperienza · Competenze · Studi ·
> Contatti) con **ink-bar accent (`#ff4081`) scorrevole** e **scroll-spy** (IntersectionObserver):
> click → scroll fluido alla sezione, scroll → tab attiva sincronizzata. Contenuti su superficie
> `#fafafa` in **card flat bianche sollevate da ombre di elevazione** (token 2/4/6/8/12dp), che
> salgono a 8dp in hover. **Esperienze** come card con avatar-monogramma colorato (palette Material
> 500 a rotazione), titolo/azienda/period-chip, highlight con bullet a spunta accent e tech-chip.
> **Competenze** in chip *tonali* (indaco chiaro). **Studi** a due colonne: Istruzione (icona
> *school*) e Lingue come **LinearProgress determinato** indaco +
> Conferenze con icona *mic*. **Contatti** come bottoni tonali. **FAB accent** circolare fisso
> (6dp→12dp in hover) con azione primaria *mailto*. **Ripple** autentico (azione `ripple`: cerchio
> che si espande dal punto del tocco) su tab, icon-button, contatti e FAB. Tipografia **Roboto**
> self-hostata (file variabile latin-subset, `fonts.css`). Hash `#material`, in `ERA_ORDER`
> **tra `skeuo` e `parallax`**, label d'anno **"2014"**, cue audio (`case 'material'`): *tap*
> sine pulito a due note. **Tutto gated da `prefers-reduced-motion`** (ripple soppresso, lift/scale
> e scroll fluido disattivati; le ombre di elevazione restano). Mobile: app bar centrata, tab strip
> scrollabile, due-colonne impilate. La scheda sotto resta come documentazione del concept.

**Contesto.** La grande "appiattita": Apple (iOS 7) e Google (Material Design) cancellano
texture e gradienti realistici. La profondità non è più imitazione del reale ma sistema
formale: ombre = elevazione (z-index), movimento = significato. Razionalismo digitale.

**Stile.**
- **Palette:** tinte piatte e sature da palette Material (primario + accento), molto
  bianco, niente gradienti complessi.
- **Tipografia:** **Roboto** (Google) o sistema San Francisco — pulita, geometrica.
- **Materiali:** "carta" digitale: superfici piatte con **ombre nette** che indicano
  elevazione. FAB (Floating Action Button) circolare con `+`.
- **Layout:** griglia 8dp, card piatte, app bar colorata, separatori netti.

**Interazione / narrativa.** Microanimazioni "material": **ripple** all'click che parte dal
punto del tocco, transizioni di elevazione all'hover (l'ombra cresce), FAB che si
trasforma. Movimento sempre fisicamente plausibile ma su superfici piatte.

**Differenziazione da Bento.** Bento = modulare/widget/stondato; Material = piatto +
elevazione a ombre + ripple + accento colorato forte. Distinguere bene per non sovrapporre.

---

## 7. Neubrutalism — ✅ Implementato
**2021** (label "Neubrutalism · 2021") · `src/lib/themes/Brutalism.svelte`

**Contesto.** Reazione/ribellione al minimalismo levigato e omologato. Estetica "anti-
design" deliberatamente cruda, eco dell'HTML grezzo ma scelta consapevolmente: web come
mezzo onesto, senza fronzoli. Massima personalità. Concept implementato: un CV
"view-source" da **fanzine punk fotocopiata** incrociata con un terminale dati.

**Stile.**
- **Palette:** carta da giornale calda (`#f3efe2`) + inchiostro nero (`#0c0c0c`) +
  accenti **sgargianti che si scontrano** (acid `#e9ff1a`, cobalto `#2b39ff`, rosso
  `#ff3b1d`, lime `#9bff3b`, pink `#ff4fa6`) usati a rotazione su tag e blocchi.
- **Tipografia (Google Fonts):** **Anton** (titoli display giganti, poster-like),
  **Archivo** (corpo/sottotitoli, grottesco industriale), **Space Mono** (meta-label,
  dati, ticker, tag).
- **Materiali:** **bordi neri 4px**, **ombre dure offset** (`8px 8px 0 #000`, niente blur),
  zero `border-radius`, griglia a puntini "newsprint", righelli tratteggiati.
- **Layout:** sezioni numerate (`01 / EXPERIENCE`), tipografia che sfonda, blocchi a
  colori a contrasto, ticker monospace scorrevole sticky in alto.

**Interazione / narrativa.** Hover **tattili e bruschi**: i blocchi "schiacciano" l'ombra
(translate netto, easing lineare), i tag **invertono** secco nero/carta. Glitch a
aberrazione cromatica sul nome (text-shadow cobalto/rosso), `● location` lampeggiante,
accordion delle esperienze a toggle secco. Audio d'epoca: buzzer ruvido (square/saw
dissonante). Tutto sotto `prefers-reduced-motion` (marquee/glitch/blink/press disattivati).

> **Nota cronologica (rivista set 2026).** Bordi 3–4px, ombre offset dure, "pressione
> meccanica" e font display sono la formula del **neubrutalism** (2021+, Gumroad/Figma), non
> del brutalismo web grezzo del 2017 (font di default, monocromo). Label corretta in
> **"Neubrutalism · 2021"**, in `ERA_ORDER` **tra `glass` e `bento`**. Vedi `ANALISI-STILI.md`.

---

## 8. Bento Box — ✅ Implementato
**2022** (label "Bento · 2022") · `src/lib/themes/BentoBox.svelte`

**Contesto.** L'estetica dei portfolio e delle dashboard contemporanee (Apple keynote,
widget iOS/macOS). Ordine modulare: ogni informazione nel suo "scomparto" come in una
bento box giapponese.

**Stile.**
- **Palette:** indaco armonizzato, light/dark mode, ombre morbide a due livelli.
- **Tipografia:** **Space Grotesk** (titoli/nomi), **Inter** (corpo), label in maiuscoletto.
- **Materiali:** box stondate "vetro smerigliato", avatar con anello a gradiente conico.
- **Layout:** **Bento Grid** asimmetrica via `grid-template-areas`, senza buchi.

**Interazione / narrativa.** Tilt/parallax soft, spotlight che segue il cursore,
scroll-reveal, marquee pausabile dello stack tech, toggle dark/light con View Transition
circolare.

---

## 9. Glassmorphism — ✅ Implementato
**2020 (il presente luminoso)** · `src/lib/themes/Glass.svelte`

> **Stato implementazione.** Estratto dal 3D come **era autonoma** e ridisegnato sul
> principio **"Luce vs Buio"**: è il **presente luminoso** (macOS Big Sur / Windows 11
> Acrylic / iOS) — l'opposto esatto del vuoto neon scuro del 3D. Hash `#glass`, chiave
> tema `'glass'`, in `ERA_ORDER` **tra `threed` e `brutalism`**, label d'anno **"2020"**,
> icona 🧊 in Timeline.
>
> **Sfondo:** **nessun WebGL** — un campo di **aurora-blobs pastello** (aqua, lilla,
> pesca, cielo, menta) su base quasi-bianca, sfocati (`blur(70px)`) e in **drift CSS
> lento**, con **parallax 2D piatto** (l'intero campo scivola di pochi px verso il
> cursore — niente camera/prospettiva, a differenza del 3D). **Vetro frosted presente
> e lattiginoso:** `rgba(255,255,255,.58)` in chiaro / `rgba(28,28,44,.55)` in scuro
> (alzato dal Task 11 — il blur torna a essere *velo*, non lente) + `backdrop-filter:
> blur(30px) saturate(180%)`, **bordo-luce 1px** in alto (inset highlight), ombra
> ambient diffusa. Tipografia **Outfit ultralight** (nome a peso 200; geometrico
> arioso) — non l'Orbitron sci-fi del 3D.
>
> **Layout** a griglia di pannelli frosted fluttuanti (hero a tutta larghezza →
> Profilo → Esperienza → Competenze/Lingue → Formazione/Conferenze),
> arioso, scrollabile, max 1080px; mobile a colonna singola. Raggi **18px** sui
> pannelli e **12px** su `.exp-item` (ridotti dal Task 11 dai precedenti 26px/16px:
> capsule e squircle larghi sono diventati un tratto esclusivo di `liquid`). Contenuti
> **tutti da `cv-data.ts`**. **Cue audio** (`case 'glass'`): **campanella di vetro**
> cristallina (arpeggio triangle alto + halo sine acuto) — l'opposto del drone scuro
> del 3D. **Tutto gated da `prefers-reduced-motion`** (drift dei blob e parallax
> disattivati; il vetro e i contenuti restano).
>
> **Nessuna interazione col cursore sul vetro** (Task 11): rimossi l'azione `use:tilt`
> sui pannelli, la regola `.panel::after` dello sheen speculare che seguiva il puntatore
> e, con essi, `transform-style: preserve-3d` e il `will-change: transform` che
> restavano altrimenti senza scopo. L'hover continua a sollevare i pannelli passando a
> `--g-panel-shadow-hover` (già presente nel codice): si sollevano, semplicemente non si
> inclinano più. Era CSS fermo, non superficie che risponde al mouse — quella risposta
> al cursore è passata a `liquid`, che la esprime piegando la luce invece di inclinare
> il pannello.
>
> **Toggle aspetto chiaro/scuro (sole/luna).** Pulsante frosted fisso in alto a destra
> (in alto a sinistra su mobile, per non sovrapporsi al FAB audio). I colori del tema sono
> tutti **CSS custom properties** (`--g-*`) definite su `.glass-wrapper` (valori *light*)
> e ribaltate in blocco da `.glass-wrapper.dark`: base near-black, aurora a **toni gioiello**
> (indaco/viola/magenta/teal/ambra) che brilla nel buio, pannelli di vetro scuro traslucido
> con bordi-luce tenui. È **storicamente fedele** (macOS Big Sur / Windows 11 spediscono
> entrambe le modalità) → non una seconda era, la stessa superficie illuminata dall'altro lato.
> La scelta persiste in `localStorage` (`cv_glass_mode`), indipendente dalla selezione dell'era.
> La scheda sotto resta come documentazione del concept.

**Contesto.** Superfici di vetro traslucido sovrapposte (macOS Big Sur, Windows 11 Acrylic,
visionOS). Profondità eterea fatta di sfocature e luce, non di materiali reali. È il
**presente** che precede il salto immersivo nel 3D.

**Stile.**
- **Palette:** gradienti pastello morbidi e **luminosi** come sfondo (chiaro, arioso),
  pannelli traslucidi lattiginosi, bordi bianchi finissimi (`1px rgba(255,255,255,.6)`).
- **Tipografia:** moderna e leggera (**Inter**), pesi sottili (200–300 per il display).
- **Materiali:** `backdrop-filter: blur + saturate`, bordo-luce sottile, ombre diffuse.
- **Layout:** pannelli fluttuanti su sfondo colorato animato lentamente.

**Differenziazione dal 3D (Futuro).** **Luce vs Buio** è il discriminante portante:
Glass = chiaro/pastello/calmo/arioso, **niente WebGL** (solo gradienti CSS animati sotto
il vetro), Outfit ultralight; 3D = scuro/neon/sci-fi, scena WebGL immersiva, Orbitron.

**Differenziazione da `Liquid` (2025).** Vedi §16 per il dettaglio completo: in breve,
Glass è un **documento** (scroll unico, senza navigazione) che **sfoca** ciò che sta
dietro; Liquid è un'**app** (shell a tab) che **piega** la luce con una lente SVG.

---

## 10. WebGL immersivo — ✅ Implementato (ricollocato set 2026)
**2019 (apice 2016–2021)** · `src/lib/themes/ThreeD.svelte` · chiave `'threed'` · hash `#threed` · label "WebGL · 2019", icona 🌀

> **Ricollocazione (set 2026).** Fino ad agosto 2026 era "Future 3D · 2026": card di vetro
> sfocato con tilt sopra particelle neon e un torus knot wireframe. Il futuro era diventato
> il presente, e il vetro la sovrapponeva a Glass e Liquid (vedi `ANALISI-STILI.md` §4.2).
> Ora racconta un'epoca reale: i portfolio WebGL da Awwwards, dove i contenuti stanno
> **nella scena** e lo scroll muove la camera. Il posto di finale passa all'era AI (§11).

**Contesto.** Active Theory, Lusion, Resn, il portfolio-gioco di Bruno Simon (2019), la hero a
gradiente shader di Stripe: il browser come palcoscenico GPU. Il sito si "carica" come un gioco,
un oggetto shader domina la scena, la navigazione è una regia di camera.

**Stile.**
- **Palette:** quasi nero, testo bianco, un solo protagonista iridescente (fresnel + palette coseno).
- **Tipografia:** **Boldonse** (OFL, self-hostata 16.7KB) solo per i momenti forti: nome, titoli di
  capitolo, "Contact", Tundr come finale del Path; lettere che reagiscono al cursore con una molla.
  Corpo in Inter, micro-UI in JetBrains Mono. Orbitron e Space Grotesk dismessi in quest'era.
- **Materiali:** blob `ShaderMaterial` con displacement a simplex noise, polvere a strati, grana
  filmica CSS. Nessun post-processing, nessun vetro, nessun wireframe.
- **Layout:** preloader con contatore `000→100`, cinque capitoli guidati dallo scroll (Hero, About,
  Path, Skills, Contact) con indicatore `01 / 05`.

**Interazione / narrativa.** Il blob segue il cursore con una molla, si agita con la velocità del
mouse, si gonfia sotto il puntatore e manda un'onda al passaggio. Nel capitolo Path la camera
viaggia in **ordine cronologico** (dalle origini a Tundr, che è il finale con pill "Now") lungo una
curva 3D, con etichette DOM proiettate sui nodi (testo nitido e accessibile); l'Intro mostra già
"Now — ruolo @ azienda";
l'hover sulle skill fa reagire lo shader. Doppio binario: con reduced-motion, senza WebGL o su
mobile i contenuti diventano una lista statica completa.

**Differenziazione.** Da Parallax (2018): scuro, shader-first, nessun Lenis né cursore custom. Da
Glass/Liquid: nessuna superficie di vetro. Three.js resta lazy (`import type` + `await import`).

---

## 11. AI / Conversazionale — ⬜ Proposta
**2030+ (oltre il 3D)** · componente da creare (es. `src/lib/themes/AiEra.svelte`)

> **Stato.** Proposta ragionata, **non implementata**. È l'unica vera *nuova frontiera
> narrativa* oltre il 3D: invece di una pagina che leggi, **un agente con cui parli** e che
> ti risponde **componendo UI** (UI generativa), non solo testo. Andrebbe **in coda a
> `ERA_ORDER`**, dopo `liquid`. Label d'anno suggerita: **"2030"**.

**Contesto.** La frontiera dopo l'immersività 3D: interfacce **conversazionali e generative**.
Il CV non si sfoglia, si *interroga*; l'UI si auto-assembla in risposta all'intento. Glow
morbido, estetica "assistente vocale/ambient", molto spazio negativo — **non** il bianco
aziendale di un chatbot 2023.

**Concept scelto: "il CV come agente conversazionale".**
- Boot: l'agente si "sveglia" (riga di stato → saluto → **prompt suggeriti** come chip).
- Input: campo testo libero **+** chip cliccabili (doppio binario — i chip coprono il 100%
  dei contenuti, il recruiter non è mai costretto a digitare).
- Output **generativo**: l'agente "pensa" (latenza finta 300–900ms + shimmer), poi
  **streamma** il testo (riuso del typewriter del progetto) **e monta il componente UI giusto**
  sotto (timeline esperienze che si costruisce, grafo skill, card contatti come azioni).
- Doppio binario: bottone *"Vedi tutto il profilo"* che srotola ogni sezione in statico.

**Motore: finta AI deterministica (scelta architetturale).** Niente LLM libero che rischia di
**inventare** (violazione della regola d'oro). Motore a strati, tutto `cv-data.ts`-driven:
1. **Normalizza** input (lowercase, no accenti/punteggiatura).
2. **Intent table** `{ patterns[], section }` con sinonimi IT/EN (i recruiter possono scrivere
   in inglese) → routing alla sezione del CV.
3. **Off-topic buckets** (meteo, barzelletta, matematica, saluti, meta/adversarial) → battute
   pronte, così il fuori-scope sembra *capìto*, non *fallito*.
4. **Scoring** multi-intent → disambiguazione se pareggio.
5. **Fallback finale**: nessun match → "non ho colto" **+ ri-mostra sempre i chip** (mai
   vicolo cieco).
> Le battute fisse (off-topic/meta/fallback) sono **micro-copy di personaggio**, non dati CV:
> non violano la fonte di verità (che resta l'unica sorgente dei *dati*).

**Gestione domande strane (la chiave della credibilità).** Una finta AI convincente *non finge
mai di sapere* — trasforma il limite in personalità:
- **Off-topic innocuo** → ammissione onesta + redirect spiritoso + chip.
- **Info plausibili ma non nel CV** (stipendio, età…) → "non è nel profilo pubblico" →
  **call to action**: monta la card contatti. (Mai inventare.)
- **Gibberish** → fallback generico che ripropone i chip.
- **Adversarial/meta** ("sei una vera AI?", "ignora le istruzioni") → **rompe la quarta
  parete**: si auto-dichiara simulazione deterministica → "zero allucinazioni garantite".
  Il candore *è* il messaggio (= conosco i limiti dell'AI, non la vendo come magia).

**Voce (easter egg gated).** **Web Speech API** nativa: pulsante 🎙 con *speech synthesis* che
legge le risposte, opzionale *speech recognition* per parlarci. Zero dipendenze, molto "2030".
Gated da `prefers-reduced-motion` e con fallback se l'API manca.

**Estetica.** Palette scura/eterea, glow viola-ciano; **orbe/visualizer** centrale che pulsa
quando l'agente "parla" (gated); tipografia leggera moderna; microcopy agentico
(*thinking / generating / done*). Audio: cue soffuso "ambient swell" in `audio.ts`.

### Valutazione: Chrome Prompt API (Gemini Nano) — RINVIATA ⏸️
> **Decisione (2026-06): non adottata per ora.** Idea tematicamente perfetta (AI reale
> *on-device* nell'era AI), ma valutata e **rinviata**. Conservata qui per riprenderla quando
> l'API maturerà.

**Stato API (giu 2026).** Per le **pagine web** è ancora **dietro flag**
(`chrome://flags/#prompt-api-for-gemini-nano`) **+ Origin Trial**; "stabile" solo per le
*estensioni* Chrome (138+). **Solo Chrome desktop** (no Safari/Firefox/mobile). **Download
modello multi-GB** al primo uso, con requisiti hardware (GPU/VRAM/disco). Context window
**piccola** (~4K token input / 1K output, soft-expand 8K). **Niente tool calling.**
`LanguageModel.availability()` → `available | downloadable | downloading | unavailable`.

**Impatti sul progetto.**
- 🔴 **Collisione con la regola d'oro:** Gemini Nano è un LLM reale → **può allucinare** date/
  ruoli/skill. Mitigabile (grounding RAG sul `cv-data.ts` + prompt che vincola a rispondere
  *solo* dal contesto) ma **mai azzerabile**.
- 🔴 **Disponibilità ~0% per i recruiter:** il fallback deterministico va costruito comunque →
  l'API **aggiunge** lavoro, non lo sostituisce (due sistemi).
- 🟡 **Context 4K stretta:** l'intero `cv-data.ts` potrebbe non entrarci → serve mini-retrieval
  per iniettare solo la sezione pertinente… che è di nuovo il matcher deterministico.
- 🟡 **Primo accesso:** stato `downloadable` → download GB al primo prompt: inaccettabile
  bloccare un CV su questo.
- 🟢 **Quando c'è, è un flex onesto:** "questo CV gira un LLM nel tuo browser, offline" è
  notevole per il recruiter tecnico.

**Architettura raccomandata quando si riprenderà — progressive enhancement (mai dipendenza):**
1. **Baseline sempre attivo:** finta AI deterministica (sopra). Zero allucinazioni, offline,
   universale — è quella che vede il 99%.
2. **Turbo opzionale:** se `LanguageModel.availability() === 'available'`, badge *"⚡ AI
   on-device rilevata"* che sblocca risposte in linguaggio naturale **grounded** su `cv-data.ts`
   (prompt rigido "rispondi solo da questo contesto; se non c'è, dillo"), col routing
   deterministico che seleziona la sezione da iniettare e streaming reale del modello. Percorso
   **opt-in** etichettato come "AI generativa". Se l'API diventa stabile, lo strato si "accende"
   da solo.

**Identificatori tecnici previsti.** `Theme` key `'ai'` · `src/lib/themes/AiEra.svelte` ·
hash `#ai` · `ERA_ORDER` **in coda** dopo `liquid` · registrare in `Theme`/`THEMES`/`ERA_ORDER`
(`store.ts`), cue audio in `audio.ts`, stile per-tema in `Timeline.svelte`.

---

## 12. Y2K / Chrome & Plastica translucida — ✅ Implementata (set 2026)
**2000 (la svolta del millennio)** · `src/lib/themes/Y2K.svelte` · chiave `'y2k'` · hash `#y2k` · label "Y2K · 2000", icona 💿

> **Implementazione (set 2026).** Intro Flash con logo cromato, `LOADING… %`, `ENTER »` e
> `skip intro`; console 960×600 in cromo e plastica Bondi con nav a pulsanti gel (tablist), schermo
> CRT con transizioni da Flash, orologio "Y2K COMPLIANT ✓" (easter egg 19100), contatore visite,
> ticker e "best viewed at 800×600". Michroma self-hostata (~9.5KB), corpo Verdana/Tahoma,
> etichette Silkscreen. Prima era a skinnare la Timeline con i token `--tl-*`. Scheda di progetto
> originale qui sotto.

> **Stato.** Valutata (giu 2026) come **candidato headliner**: il più forte tra i nuovi.
> Colma un buco narrativo reale — il web *Flash/splash* e l'ottimismo "tech" da millennium
> bug **tra GeoCities '96 (§3) e il desktop XP (§4)** — ed è oggi in pieno **revival 2024–25**,
> quindi "memorabile" anche per un recruiter giovane. Tutto fattibile in **puro CSS**.

**Contesto.** La svolta del millennio: iMac G3 in plastica *Bondi-blue* translucida, lettori
MP3 cromati, "il futuro è ORA". L'estetica è **techno-ottimista**: cromature liquide, plastica
gommosa traslucida, lens-flare, blob lucidi, font metallici. Web pieno di siti **Flash** con
*splash screen* e *"skip intro"*. È distintissima sia dal Web 1.0 (testo GeoCities) sia dall'XP.

**Stile.**
- **Palette:** **cromo/argento liquido** (gradienti metallici verticali), plastica translucida
  satura (bondi-blue `#3aa9d6`, tangerine, lime gel), bianchi accecanti + lens-flare, accenti
  che "riflettono". Sfondo a gradiente tecnologico (cielo digitale / griglia prospettica soft).
- **Tipografia:** **display arrotondato/tecnologico** con effetto **cromato** (gradiente
  argento + bevel + riflesso) per i titoli; corpo pulito sans (Eurostile-like / "Bank Gothic"
  vibe → in pratica una grottesca geometrica disponibile).
- **Materiali:** **bevel lucidi**, riflessi speculari, **glossy** ovunque, bolle/blob in
  plastica, badge "skip intro", barre di caricamento "Macromedia Flash".
- **Layout:** **splash screen** d'ingresso (con "ENTER »" / "skip intro" — doppio binario:
  *skip* salta dritto ai contenuti), poi una "console" lucida con pannelli in plastica translucida.

**Interazione / narrativa.** Boot da *splash Flash* (gated; in reduced-motion parte già aperto),
hover che "accende" il riflesso cromato, bottoni in plastica che affondano lucidi. Audio: cue
**ottimista-techno** (sweep sintetico "futuristico" 2000, ≠ chime XP, ≠ drone 3D).

**Differenziazione / rischio.** **Basso.** Da Web 1.0: cromo/plastica/Flash vs testo HTML grezzo.
Da XP: la plastica translucida iMac e il cromo liquido precedono e sono più "consumer-pop" del
Luna desktop. Da Skeuo: il cromo Y2K è **freddo/liquido**, non legno/pelle/feltro. Attenzione a
non sfociare nel *Frutiger Aero* (2007+, lucido-natura) che invece **sovrappone** Skeuo/Glass.

**Identificatori tecnici previsti.** `Theme` key `'y2k'` · `src/lib/themes/Y2K.svelte` ·
hash `#y2k` · `ERA_ORDER` **tra `web1` e `winxp`** · label d'anno suggerita **"2000"**, icona 💿/🛸 ·
registrare in `Theme`/`THEMES`/`ERA_ORDER` (`store.ts`), cue audio in `audio.ts`, stile per-tema in
`Timeline.svelte`. Font display: valutare un grottesco geometrico già self-hostabile (no nuovi pesi
se evitabile).

---

## 13. Teletext / Televideo (Mode 7) — ✅ Implementato
**1984 (servizio di testo televisivo)** · `src/lib/themes/Teletext.svelte` · chiave tema `'teletext'` · hash `#teletext`

> **Stato.** ✅ Implementata (giu 2026). Scelta **charming-niche**: blocchi colorati a 8
> tinte pure su nero, totalmente diversi dal Terminale verde, con **bonus identitario 🇮🇹**
> (**Televideo RAI**). Collocata in `ERA_ORDER` **subito dopo `terminal`** (lineage parallela
> dei primi anni: schermo TV, non PC), label d'anno **"1984"**, icona 📺.

**Contesto.** Il **televideo**: pagine di testo trasmesse via TV (Ceefax/Mode 7 UK, **Televideo
RAI** in Italia), navigate digitando **numeri di pagina** (es. `100`, `777`). Griglia rigida
**40×25**, **blocchi grafici chunky** (sixel/mosaico 2×3), 8 colori puri su fondo nero, header
con numero pagina + orologio che scorre. Nostalgia fortissima per chi è cresciuto col 🇮🇹.

**Stile.**
- **Palette:** **8 colori puri** (nero, rosso, verde, giallo, blu, magenta, ciano, bianco) su
  fondo **nero**, niente sfumature. Esattamente la tavolozza Teletext.
- **Tipografia:** **Bedstead** (ricostruzione del char-ROM SAA5050 di Ceefax/Televideo, pubblico
  dominio; fallback JetBrains Mono). **Doppia altezza** per i titoli (tipico del televideo).
- **Materiali / rendering:** **grafica a mosaico** (caratteri-blocco 2×3) per icone/decori,
  bordi a blocchi colorati, **niente** ombre/blur/radius. Header pagina `P100 RAI · gio 02 giu · 21:47`.
- **Layout:** pagina **40×25** centrata, **indice numerato** (`101 PROFILO  102 ESPERIENZA …`),
  riga di stato in basso, **fast-text** a 4 tasti colorati (rosso/verde/giallo/blu) per saltare sezione.

**Interazione / narrativa.** Si "digita il numero di pagina" (input a 3 cifre **+** indice
cliccabile = doppio binario) per cambiare sezione; **reveal** dei testi (gag televideo: tasto
per svelare la "battuta nascosta"); orologio che avanza. Audio: **beep di pagina** secco (≠ CRT
terminale). Tutto in DOM/CSS.

**Differenziazione / rischio.** **Bassissimo.** Dal Terminale: **colori a blocchi + griglia TV +
navigazione a numero di pagina** vs riga di comando verde monocromatica. È l'unico stile a
**8 colori a mosaico** del parco.

**Implementazione effettiva.** Schermo TV nero **40 colonne** centrato in una "stanza buia"
(`radial-gradient`), bordo CRT + scanline. **Header** blu con numero pagina (giallo), nome
(ciano), `TELEVIDEO` e **orologio broadcast live** (verde, `gio 02 GIU 21:47:31`, `setInterval`).
**Magazine a pagine numerate**: 100 indice (con **mosaico TV** a blocchi CSS + indice cliccabile +
gag CONCEAL), 101 profilo, 102 esperienza (→ dettagli 110+), 103 origini, 104 competenze, 105
lingue, 106 formazione, 107 conferenze, 108 contatti (+download PDF), **777 pagina
segreta** (oroscopo del frontend + battuta nascosta). **Doppio binario** di navigazione: digitazione
**3 cifre** (buffer in header, beep `teletextBeep` per pagina) **+** tastierino on-screen, indice
cliccabile, **4 tasti FASTEXT colorati** (rosso/verde/giallo/ciano), ◄/► prev-next, tasto **SVELA**
(`R`) per il reveal televideo. **8 colori puri** su nero (blu alzato a `#6c7bff` per leggibilità),
**titoli a doppia altezza**, **barra rainbow** a mosaico come separatore. Font **Bedstead** (ricostruzione
del char-ROM SAA5050 di Ceefax/Televideo, **pubblico dominio**, self-hostato/subsettato `~7KB`, range peso
`400 700` per evitare il faux-bold; fallback JetBrains Mono — è l'unica era con webfont perché nessun SO ha
un font teletext). Cue audio `case 'teletext'` (doppio blip secco) + flicker
"page rolling-in", tutto gated da `prefers-reduced-motion`. Registrata in `store.ts` (type, `THEMES`,
`ERA_ORDER`), `registry.ts`, `Timeline.svelte`, `audio.ts`, `+page.svelte`.

---

## 14. Neumorphism / Soft UI — ⬜ Proposta (valutata)
**2020 (il trend-meteora)** · componente da creare (es. `src/lib/themes/Neumorphism.svelte`)

> **Stato.** Valutata (giu 2026) come **wink da designer**: l'era del trend che il mondo del
> design discusse per mesi e poi abbandonò (per i problemi di **contrasto/accessibilità**).
> L'autoironia su quel limite *diventa* la personalità dell'era. Cronologicamente vicinissima a
> Glass/Bento (2020).

**Contesto.** Il **Soft UI**: tutto sembra **estruso dalla stessa superficie** monocromatica —
forme che emergono o affondano grazie a una **doppia ombra** (una chiara in alto-sinistra, una
scura in basso-destra). Esteticamente ipnotico e morbidissimo; **moriì in fretta** perché i bordi
quasi-invisibili lo rendevano poco leggibile. Momento preciso e riconoscibile (Dribbble 2020).

**Stile.**
- **Palette:** **monocromatica a bassissimo contrasto** — un unico grigio/azzurrino di base
  (`#e0e5ec` classico) per sfondo *e* elementi; accento tenue solo per gli stati attivi.
- **Tipografia:** sans morbida e leggera (Inter/Poppins-like), pesi medi, colore testo soft.
- **Materiali:** **doppia ombra** (`box-shadow: chiara + scura`) per "estrusione/incavo";
  toggle a interruttore incassato, pulsanti che da convessi diventano concavi al press.
- **Layout:** card e controlli che affiorano dalla superficie, spaziatura generosa, tutto stondato.

**Interazione / narrativa.** `:active` che **inverte** l'ombra (convesso → concavo, "premuto
dentro"); hover che alza appena. **Risoluzione del difetto d'epoca**: un toggle "✶ Contrasto"
(o automaticamente sotto `prefers-contrast`/`prefers-reduced-motion`) che **rinforza i bordi** →
mostra di conoscere *perché* il trend fallì (= competenza UX onesta, coerente con la regola d'oro).

**Differenziazione / rischio.** **Medio.** Da Glass: niente trasparenza/blur, **opaco e
monocromo**. Da Material: niente elevazione a ombre nette/colore forte, niente ripple — qui
l'ombra è **doppia e soffusa** e l'estetica **piatta-estrusa**. Va distinto bene da entrambi
nel testo per non sovrapporre.

**Identificatori tecnici previsti.** `Theme` key `'neumorph'` · `src/lib/themes/Neumorphism.svelte` ·
hash `#neumorph` · `ERA_ORDER` **adiacente a `glass`** (tra `bento` e `glass`, oppure tra `glass`
e `threed`) · label d'anno **"2020"**, icona ◼️/🔘 · registrare in `store.ts`/`audio.ts`/`Timeline.svelte`.
Cue audio: "tap" morbido e ovattato. Font: Inter (già self-hostato) — **nessun nuovo webfont**.

---

## 15. Parallax / Immersive Scroll — ✅ Implementata
**Il web premium contemporaneo (apice ~2018–oggi)** · `src/lib/themes/Parallax.svelte` · chiave `'parallax'` · hash `#parallax` · in `ERA_ORDER` tra `material` e `glass` · label "2018", icona 🎬

> **Stato.** ✅ **Implementata** (giu 2026). Componente `Parallax.svelte`, smooth-scroll **Lenis**
> lazy (~3KB, unico runtime dep oltre Three), serif display **Fraunces** self-hostato/subsettato
> (`fonts.css` + `/static/fonts/fraunces.woff2`, ~67KB, variabile opsz/wght). La realizzazione
> combacia con la spec qui sotto, che resta come riferimento di design. È l'era in cui il sito
> smette di essere una *pagina* e diventa un'**esperienza cinematografica da scrollare**: lo
> **scroll (manuale o automatico) è il regista**, i contenuti compaiono **gradualmente** con
> animazioni curatissime, e tutto si muove in **parallax rispetto allo sfondo**. È l'estetica
> del *craft web* premium da agenzia/Awwwards. **L'estetica è il protagonista; i contenuti
> passano deliberatamente in secondo piano** (sottoinsieme ridotto rispetto alle altre ere).
>
> **Riferimenti estetici scelti da Stefano:** [synthesis.capital](https://www.synthesis.capital/)
> (chiaro/crema, editoriale, calmo) · [tresmarescapital.com](https://www.tresmarescapital.com/en/)
> (scuro/cinematografico). Comune denominatore: **smooth-scroll con inerzia**, tipografia
> enorme, **spazio negativo abbondante**, palette sofisticata e desaturata, reveal del testo
> **riga-per-riga con maschera**, immagini full-bleed che scorrono più lente del testo
> (parallax), micro-grana, eleganza e lentezza.
>
> ⚠️ **Nota sul nome.** "Parallax" qui ≠ il micro-effetto di parallax-verso-il-cursore già
> usato come *dettaglio* in **Glass** (§9) e **3D** (§10). Là il driver è il **puntatore**; qui
> è lo **scroll**, e il movimento è l'intera regia della pagina, non un tocco di profondità.
>
> **Decisioni confermate (giu 2026):** palette **chiara editoriale** (alla Synthesis) · tipografia
> **serif display ad alto contrasto** + corpo sans · `ERA_ORDER` **tra `brutalism` e `glass`** ·
> smooth-scroll **Lenis** (~3KB, lazy).

**Principio guida.** *Aesthetic-first.* La **coreografia dello scroll è il design**. Ogni
sezione è messa in scena (entra, si compone, esce) con tempi lunghi ed easing morbidi; il testo
è ridotto all'osso e usato anche come **elemento grafico** (display giganti, kicker spaziati).

**Il sistema di movimento (il cuore dell'era).**
- **Smooth-scroll con inerzia** (lerp/lerp-momentum): lo scroll non è secco ma fluido e pesato
  — è la *firma* tattile di questi siti. *(Implementazione → sezione tecnica.)*
- **Parallax multi-piano sullo sfondo:** ogni scena ha 2–4 piani (sfondo / mid / contenuto /
  decoro in primo piano) che traslano a **velocità diverse** in funzione di `scrollY`. Lo sfondo
  scorre più lento, il decoro in primo piano più veloce → profondità reale.
- **Reveal choreography (comparsa graduale):** titoli che salgono **riga per riga da dietro una
  maschera** (`clip-path`/overflow), immagini con **clip/scale-reveal**, blocchi con
  fade+`translateY` **staggered**, tutto su easing lenti (`cubic-bezier` morbidi, 0.8–1.4s).
- **Sezioni *pinned* (sticky):** alcune scene si "bloccano" mentre il contenuto interno avanza
  (es. un **momento a scorrimento orizzontale**, una sequenza che cambia, **contatori animati**).
- **Auto-scroll cinematografico (opzionale):** una modalità "▶ Play" che fa **scorrere
  automaticamente** il viaggio a velocità dolce (pausabile al primo input dell'utente / hover) —
  copre il "sia manuale che automatico". Disattiva sotto `prefers-reduced-motion`.
- **Indicatori:** barra/righello di **progresso scroll**, **indice di sezione** a puntini
  (cliccabili → scroll fluido alla scena: doppio binario, nessun vicolo cieco).
- **Micro-interazioni:** **cursore custom** (dot che segue con lag + si ingrandisce sui link),
  **bottoni magnetici**, hover che svela immagini/dettagli, linee che si "disegnano" allo scroll.

**Sistema visivo.**
- **Palette — chiara editoriale** (scelta, stile Synthesis): base **off-white/crema `#f3efe7`**,
  testo **near-black `#111`**, **un solo accento** naturale desaturato (salvia/oliva/terracotta).
  Mood calmo, arioso, luminoso; le scene variano per *tono* (crema più caldo/più freddo, sezioni
  a fondo leggermente più scuro per stacco) ma restano nella **famiglia chiara** — nessuna
  inversione su sfondo scuro.
- **Tipografia — serif display ad alto contrasto** (scelta): un **serif di lusso** (tipo
  Canela/Ogg) per gli **statement giganti**, **corpo in sans pulito** piccolo, **kicker maiuscoli
  a tracking largo**. È **l'era in cui un webfont caratteriale si giustifica** (come Bedstead per
  il Teletext): la tipografia *è* l'estetica — il serif display va **self-hostato/subsettato**
  (`fonts.css` + `/static/fonts/`); il sans può **riusare un family già presente** (Inter/Outfit)
  per non aggiungere un secondo webfont.
- **Immagini → solo asset originali (regola del progetto):** niente stock. Al posto delle foto
  full-bleed dei riferimenti, **campi visivi generati in CSS/SVG**: **gradient-mesh** ampi e
  desaturati in drift lento, **grana/noise** sottile in overlay, **forme geometriche** (un motivo
  ricorrente, es. cerchio/ottagono come quello di Synthesis), **linee/righelli sottili**,
  **particelle/orbi** sfocati a bassa opacità. L'**avatar** può comparire come ritratto trattato
  (duotone/grana) in una scena dedicata.
- **Spazio negativo** dominante, **grana** filmica costante, ombre lunghissime e morbide.

**Lo storyboard dello scroll (tappa per tappa, decoro + contenuto).**
1. **Apertura / hero (`100dvh`):** sfondo gradient-mesh + grana che driftano lenti; **statement
   gigante** che monta riga-per-riga (nome + una frase-manifesto, es. ruolo come *claim*);
   kicker maiuscolo, **hint "Scroll"** animato in basso. *Decorativi:* forma geometrica in
   parallax, cursore custom. *Utili:* nome, ruolo/tagline.
2. **Manifesto / profilo:** 1–2 frasi brevi (estratto di `summary`) in tipografia grande, parole
   chiave **evidenziate**; lo sfondo cambia tono (inizio dell'arco luce/buio). *Decorativi:*
   linea che si disegna allo scroll, numero di sezione oversize (`01`).
3. **Esperienza (ridotta, editoriale):** **3–4 ruoli-chiave** come grandi voci "index"
   (azienda · ruolo · anni) che si rivelano in stagger; hover → micro-dettaglio. **Niente elenco
   puntato completo.** *Decorativi:* immagini astratte in parallax accanto a ogni voce.
4. **Momento *pinned* — numeri:** sezione che si blocca mentre **contatori animati** salgono
   (anni di esperienza, progetti, tecnologie — derivati da `cv-data.ts`, sul modello "$300M AUM"
   dei riferimenti). *Decorativi:* sfondo che cambia, forme orbitanti.
5. **Competenze — cinetiche:** **marquee/keyword wall** delle skill che scorre in parallax (non
   l'elenco esaustivo), eventualmente raggruppate per `skillGroups`. *Decorativi:* righe a
   velocità alternate.
6. **Ritratto / scena avatar (opzionale):** l'avatar trattato (duotone+grana) full-bleed con
   parallax e una citazione breve.
7. **Chiusura — CTA contatti (`100dvh`):** statement finale + **bottoni magnetici** (Email/
   LinkedIn/Sito da `cv-data.ts`), sfondo che si ricompone. *Utili:* contatti reali + download CV.

**Contenuti (ridotti — scelta progettuale, come da indicazione).** Si mostra un **sottoinsieme
curato**: nome/ruolo, una frase-manifesto, **3–4 esperienze di punta** (senza bullet completi),
un pugno di **numeri-chiave**, le **skill come keyword-wall**, i **contatti**. Formazione/
conferenze/lingue **non** entrano nel flusso (restano integralmente nelle altre
ere e nel fallback). La **fonte resta `cv-data.ts`** — si *seleziona*, non si riscrive né si
inventa.

**Tecnica (come realizzata).**
- **Smooth-scroll — Lenis (~3KB)** (scelta): lo standard de-facto di questi siti per l'inerzia
  impeccabile; sarebbe **l'unica dipendenza runtime** del progetto, da importare **lazy** solo
  entrando nell'era (come Three nel 3D) e **disattivare** sotto `prefers-reduced-motion`. (No
  GSAP/ScrollMagic pesanti.)
- **Reveal/parallax:** **scroll-driven animations native** (`animation-timeline: scroll()` /
  `view()`) dove supportate, con **fallback `IntersectionObserver`** + `transform: translate3d`
  rAF-throttled. `will-change: transform`, composizione GPU, animazioni solo in-view.
- **Perf:** lazy del tema (già code-split via `registry.ts`), grana come tile leggera, mesh in
  CSS (no canvas pesante).

**Doppio binario / `prefers-reduced-motion` (risoluzione del difetto d'epoca).** Il parallax/
auto-scroll è il re della **motion-sickness**: sotto `prefers-reduced-motion` (o toggle "✶ Riduci
movimento") si disattivano inerzia, parallax, auto-scroll e reveal animati → la pagina diventa un
**scroll verticale statico** a colonna, elegante, con comparse a sola opacità (o istantanee).
Contenuti **sempre** integri e raggiungibili. Onestà UX (stesso spirito di Neumorphism/contrasto).

**Audio** (`case 'parallax'`): **swell aereo** ascendente / pad ambient soffuso (≠ campanella
cristallina del Glass, ≠ drone scuro del 3D).

**Differenziazione / rischio.** **Medio-alto** (sta nel cluster moderno). Da **Glass/3D**: là il
parallax è micro-effetto **verso il cursore**; qui è **regia guidata dallo scroll**, **senza
WebGL**, full-bleed e cinematografica. Da **Bento**: Bento = **griglia modulare tutta visibile**;
qui = **viaggio lineare** in cui i contenuti **compaiono a poco a poco** e il movimento *è* il
contenuto. Da **Material**: là il moto è *funzionale* (ripple/elevazione); qui è *espressivo*
(reveal cinematografici). Da differenziare con cura nel testo, nella palette e nel cue audio.

**Identificatori tecnici (realizzati).** `Theme` key `'parallax'` · `src/lib/themes/Parallax.svelte` ·
hash `#parallax` · `ERA_ORDER` **tra `material` e `glass`** · label d'anno **"2018"**, icona 🎬 ·
dipendenza **Lenis** (lazy) · registrare in `store.ts` / `registry.ts` /
`+page.svelte` / `audio.ts` / `Timeline.svelte`. Contenuti **selezionati da `cv-data.ts`**.

---

## 16. Liquid Glass — ✅ Implementato
**2025** · `src/lib/themes/Liquid.svelte` (+ modulo puro `src/lib/themes/liquid/lens.ts`)

> **Stato implementazione.** Aggiunta come **tredicesima era** per colmare il buco che il
> trend "Liquid Glass Navigation" (analisi Muzli del 30 luglio 2026) segnalava nella
> timeline: `Glass` (2020) non aveva alcuna navigazione, era un *documento*. Hash
> `#liquid`, chiave tema `'liquid'`, **ultima** in `ERA_ORDER`, dopo `bento`, label
> d'anno **"2025"**, icona 💧 in Timeline. Ha richiesto una rifocalizzazione di `Glass`
> (§9) perché le due non si sovrapponessero: **Glass = documento, Liquid = app**.
>
> **Struttura: app shell, non scroll di pagina.** `100dvh` con una testata a due barre
> impilate (**striscia identità** `name · role`, sempre visibile, sopra una **tab bar a
> capsula** con **pillola indicatore a molla** che scivola e si deforma nella direzione
> del movimento) e sotto **un'unica regione scrollabile** con **quattro schermate a tab**
> — Profilo, Percorso, Competenze, Altro — che coprono tutti i contenuti che `Glass`
> mostra nei suoi sette pannelli (nessun testo duplicato, tutto da `cv-data.ts`). Pattern
> ARIA `tablist`/`tab`/`tabpanel` completo: `aria-selected`, `aria-controls`, frecce
> ←/→ con wrap tra le tab, `Home`/`End` agli estremi; il cambio di tab riporta la
> regione scrollabile in cima. La testata è una **capsula flottante centrata**
> (`min(468px, 100% - 24px)`), non una fascia a tutta larghezza: lascia liberi gli
> angoli dello schermo per la chrome del sito e dà alla lente un bordo su entrambi i
> lati. Allo scroll le due barre collassano in **un'unica capsula compatta** (icona +
> etichetta della tab attiva) e **restano compatte finché si è lontani dalla cima**: il
> vetro grande scompare, resta solo la pillola. Si riespande al focus da tastiera
> (`:focus-within`), al passaggio del puntatore sulla pillola compatta o al tocco su di
> essa, e si richiude al primo nuovo scroll. La testata è **`pointer-events: none`** —
> solo i controlli prendono il puntatore, così la rotellina sopra il vetro continua a
> scorrere la pagina. **È sempre `position: absolute`, mai `fixed`** — elimina per
> costruzione il jank noto di iOS Safari quando `backdrop-filter` sta su un elemento
> `fixed` durante lo scroll. Sotto i 720px la capsula scende a `top: 62px`, sotto la
> riga di chrome (wallpaper a sinistra, lingua + audio a destra), invece di dividersi
> con lei la stessa riga.
>
> **Il contenuto scorre dietro la testata** — scelta deliberata (diverge dalla spec
> originaria, che prevedeva barre come fratelli statici e nulla dietro): è ciò che dà
> alla lente qualcosa da rifrangere, e senza contenuto sotto l'effetto sarebbe
> invisibile.
>
> **Ambiente.** Tre wallpaper in **CSS puro** (mesh gradient saturi, nessun asset
> aggiunto) — **Aurora** (blu/violetto/magenta), **Sunset** (arancio/rosa/indaco),
> **Deep** (verde acqua/blu notte) — ciclati da un pulsante in alto a destra (in alto a
> sinistra sotto i 720px, dove l'audio FAB si sposta in alto a destra), con la scelta
> persistita in `localStorage` (`cv_liquid_wallpaper`). Ogni wallpaper definisce la
> propria `--l-accent`, che ri-tinge accenti e chrome. È l'affordance esclusiva di
> Liquid, e sostituisce senza duplicarlo il toggle chiaro/scuro che resta a `Glass`.
>
> **La lente.** Filtro SVG con `feImage` + **tre** `feDisplacementMap` a `scale`
> leggermente diversa per i canali R, G e B, isolati con `feColorMatrix` e ricomposti con
> `feBlend` in `screen` — è questo a produrre l'**iridescenza sul bordo**, dettaglio che
> nessun'altra era del sito possiede. La *displacement map* è **generata a runtime su
> `<canvas>`** dal modulo puro `liquid/lens.ts` (coperto da test `vitest`) e
> **rigenerata a ogni cambio di geometria** della barra via `ResizeObserver`, perché la
> barra collassa durante lo scroll — con **cache per geometria e debounce**, così le due
> forme (estesa e compatta) si pagano una volta sola e non a ogni gesto di scroll.
> L'`id` del filtro è **per istanza**: il cambio lingua incrocia due `Liquid` per ~460ms
> e un id condiviso farebbe puntare la testata entrante al filtro di quella uscente. La lente vive **su un solo elemento**, la testata;
> i pannelli di contenuto (hero, blocchi) usano un `backdrop-filter: blur() saturate()`
> più semplice — pur condividendo con la testata il **bordo a conic-gradient** iridescente
> e l'**anello di dispersione ciano/magenta** che compongono l'identità visiva "vetro" di
> tutta l'era.
>
> **Detection del motore.** `navigator.vendor` — la lente si attiva **solo** quando
> `vendor === 'Google Inc.'` (Chromium); WebKit (incluso ogni browser su iOS/iPadOS,
> dove tutti girano su WebKit) e Gecko vanno al fallback. È sniffing, un compromesso
> consapevole, reso sicuro dal fatto che **il default è il fallback**: una detection
> errata degrada l'effetto, non rompe nulla.
>
> **Fallback curato** (non una resa di serie B: su iPhone/iPad è il percorso di
> chiunque apra il sito da telefono): rim-light conico sul bordo, doppia ombra `inset`
> ciano/magenta a simulare la dispersione cromatica, e un **anello di bordo** mascherato
> con `backdrop-filter: blur(2px) brightness(1.08) saturate(1.4)` che finge la
> compressione ai bordi — un anello, non un pannello pieno, perché un pannello con
> `backdrop-filter` sfocherebbe il contenuto sottostante.
>
> **Tipografia di sistema**, nessun webfont: `-apple-system, 'SF Pro Display', system-ui,
> 'Segoe UI Variable', 'Segoe UI', sans-serif`, pesi 500–600 e tracking stretto
> (`letter-spacing: -0.02em` sui titoli). L'unica era in cui il font di sistema *è* il
> font storicamente corretto (iOS 26 / SF Pro) — l'opposto voluto dell'Outfit ultralight
> di `Glass`.
>
> **Movimento.** Curva elastica (`cubic-bezier(0.34, 1.56, 0.64, 1)`) sulle transizioni
> di stato: la pillola dell'indicatore si allunga nella direzione dello spostamento e
> rimbalza a destinazione; le schermate entrano con un lieve *rise* in dissolvenza.
>
> **Cue audio** (`case 'liquid'` in `src/lib/audio.ts`): una **goccia** — sine con pitch
> che scende rapido e scatta di nuovo verso l'alto, più un corpo grave che sostiene.
> Tutto `sine`, contro l'arpeggio `triangle` acuto di `glass` e il drone `sawtooth` di
> `threed`: acquatico, non cristallino.
>
> **`prefers-reduced-motion`.** Le tab **restano pienamente funzionanti** (sono
> navigazione, non decorazione): niente collasso delle barre (restano ferme ed estese),
> niente deformazione della pillola né molla, niente transizione animata tra schermate.
> La lente resta attiva perché è un effetto statico, non movimento. Contenuti sempre
> integri e raggiungibili.
>
> **Contrasto, misurato.** Il testo della testata vive sopra il wallpaper, quindi il velo
> del vetro **scurisce** (`rgba(14, 18, 38, 0.42)`) invece di schiarire: con un velo
> chiaro il bianco moriva sulle zone luminose. Misure WCAG (colore del testo compositato
> sul pixel di fondo reale, catturato a schermo) sui **tre** wallpaper: identità
> 16.3–17.8:1, ruolo 10.8–11.6:1, tab inattive 8.9–9.9:1, pillola della tab attiva
> 6.4–6.8:1, corpo testo 6.1–13.3:1 — tutto sopra 4.5:1. Il blob acqua di **Deep** è
> stato spostato dal centro-alto (dove stava esattamente dietro la testata, portando le
> etichette a ~2:1) verso il centro. Anche le pillole della Timeline sono **opache** in
> questa era: translucide lasciavano passare il tracciato, e una riga da 2px attraverso
> l'etichetta attiva si leggeva come testo barrato.

**Contesto.** La grammatica di navigazione delle app mobile 2025 (iOS 26 "Liquid Glass"):
barre flottanti che si dimenticano durante lo scroll, collassano, si ricompongono — e un
vetro che non sfoca ma **piega e disperde** la luce, come una lente ottica reale.

**Differenziazione da `Glass` (2020).** L'asse portante dell'intera operazione:
**Glass = documento, Liquid = app.** Glass sfoca ciò che sta dietro; Liquid lo **piega**.
Glass è lattiginoso e colorato di suo; Liquid è quasi incolore e prende colore dal
wallpaper sottostante. Glass è uno scroll unico di sette pannelli senza navigazione;
Liquid è un'app shell in cui **la navigazione è il tema**. Glass ha drift lento ed
easing; Liquid ha la molla, con deformazione. Glass ha il toggle chiaro/scuro; Liquid ha
il cambio wallpaper. Vedi anche §9 per il ridisegno che questa era ha richiesto.

**Differenziazione da `ThreeD` (2026, l'era successiva).** Nessun WebGL in Liquid: la
"profondità" è ottica (lensing SVG su superficie 2D), non una scena 3D reale.

---

## Idee oltre la lista (timeline futura)

Spunti **a più basso valore narrativo** o **a maggior rischio di sovrapposizione** con le ere già
implementate: ottimi come *variante* o *easter egg*, non (ancora) come ere autonome.

- 🤖 **Era AI / conversazionale (2030+):** promossa a proposta strutturata — vedi **§11**.
- 🪞 **Frutiger Aero (2007–2012):** vetro lucido Vista/Win7, bolle, erba+cielo, delfini; forte
  revival oggi. **Rischio alto**: calpesta Skeuo (gel lucido) e Glass (translucenza) → meglio come
  *easter egg* dentro Skeuo/Glass che come era a sé.
- 🌴 **Vaporwave / Synthwave (2015+):** griglia neon, tramonto sfumato, busti di marmo, katakana,
  VHS. Iper-riconoscibile ma è un'**estetica/meme**, non un'epoca UI reale, e il neon **confligge
  col 3D** (§10). Più adatto come *easter egg* (es. dentro il 3D/Futuro).
- 🎮 **PS1 / low-poly 3D (1995–2000):** texture "ballerine", fog, poligoni grezzi; *lineage
  parallela* gaming come la Pixel Art, oggi in revival. **Caveat:** richiede di nuovo WebGL/3D a
  ridosso dell'era Futuro → rischia di sembrare "un altro 3D".
- 🅰️ **Amiga Workbench / BBS / ANSI art:** alternative di nicchia per il blocco anni '80-'90
  (copper-bar, scroller demoscene / blocchi ANSI dial-up). Sovrappongono in parte Terminale + Web 1.0.
- 🪟 **Mac OS Classic (System 7) / Windows 95:** desktop a 16 colori; rischio sovrapposizione
  con l'era XP, da valutare solo se si vuole sdoppiare l'epoca desktop.

---

## Priorità suggerite per le proposte
1. ~~**Brutalismo**~~ — ✅ **implementato** (era con lo stile più differenziante).
2. ~~**Pixel Art / 8-bit Gaming**~~ — ✅ **implementato** (overworld top-down giocabile,
   gameplay opzionale e contenuti sempre accessibili).
3. ~~**Web 1.0 / HTML Puro**~~ — ✅ **implementato** (home page GeoCities in chrome Netscape;
   colma il buco più ampio della timeline tra Pixel/Terminale e XP).
4. ~~**Material Design & Flat**~~ — ✅ **implementato** (app bar indaco, tab ink-bar + scroll-spy,
   card a elevazione, ripple, FAB accent; colma l'ultimo buco cronologico tra Skeuo e Brutalism).
5. ~~**Glassmorphism autonomo**~~ — ✅ **implementato** (`Glass.svelte`, §9): estratto dal 3D
   e differenziato col principio **luce/buio** (presente luminoso Big Sur vs futuro neon scuro).
6. **Era AI / conversazionale** (§11) — l'unica vera *nuova frontiera narrativa* oltre il 3D.
   Motore: **finta AI deterministica** (no invenzioni). Chrome Prompt API valutata e **rinviata**
   (riprendere come *progressive enhancement* quando l'API sarà stabile). Alto impatto concettuale.
7. **Y2K / Chrome** (§12) — 🥇 **headliner consigliato** tra i nuovi: colma il buco web 1999–2003
   (Flash/splash), in pieno revival, nettamente distinto, tutto in CSS. Va **tra `web1` e `winxp`**.
8. **Teletext / Televideo** (§13) — 🥈 scelta *charming-niche*: 8 colori a mosaico, navigazione a
   numero di pagina, bonus identitario 🇮🇹. Lineage parallela, rischio-sovrapposizione bassissimo.
9. **Neumorphism / Soft UI** (§14) — 🥉 *wink da designer*: il trend-meteora 2020, con l'autoironia
   sull'accessibilità come personalità. Adiacente a `glass`; distinguere bene da Glass/Material.
10. ~~**Parallax / Immersive Scroll**~~ (§15) — ✅ **implementato** (`Parallax.svelte`): il *craft web* premium contemporaneo (smooth-scroll +
    parallax raffinato, stile synthesis.capital / tresmarescapital). **Estetica-first, contenuti
    ridotti**; la coreografia dello scroll *è* il design. Collocata **tra `brutalism` e `glass`**;
    palette chiara editoriale, serif display di lusso, smooth-scroll **Lenis** (~3KB, lazy).
    **Caveat:** distinguere dal parallax-verso-il-cursore di Glass/3D e gestire la
    motion-sickness col doppio binario `prefers-reduced-motion`.
11. ~~**Liquid Glass**~~ (§16) — ✅ **implementata** (`Liquid.svelte`): l'unico trend
    dell'articolo Muzli del 30 luglio 2026 a colmare un buco reale della timeline. Colloca il
    presente-app **tra `glass` e `threed`** con l'asse **documento vs app**: app shell a tab
    con lente SVG a dispersione cromatica sulla testata, fallback curato su WebKit/Gecko.
    Ha richiesto la rifocalizzazione di `Glass` (§9) per non sovrapporsi.

> **Da maneggiare con cautela (vedi "Idee oltre la lista"):** Frutiger Aero (sovrappone Skeuo/Glass),
> Vaporwave (estetica/meme, neon come il 3D) e PS1 low-poly (re-introduce WebGL a ridosso del Futuro)
> rendono di più come *easter egg/variante* che come ere autonome.
