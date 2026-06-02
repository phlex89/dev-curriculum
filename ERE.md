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
| 7 | Brutalismo | 2017–2020 | ✅ Implementato | `Brutalism.svelte` |
| 8 | Bento Box / Modern Flat | 2021–oggi | ✅ Implementato | `BentoBox.svelte` |
| 9 | Glassmorphism | oggi – futuro prossimo | 🟡 Parziale (unito al 3D) | dentro `ThreeD.svelte` |
| 10 | WebGL / 3D Immersivo | Il Futuro | ✅ Implementato | `ThreeD.svelte` |

> L'attuale `ERA_ORDER` è
> `['terminal', 'pixel', 'web1', 'winxp', 'skeuo', 'material', 'brutalism', 'bento', 'threed']`. La
> **Pixel Art** è una *lineage parallela* (mondo console, non desktop/web) ma
> contemporanea al Terminale, perciò è collocata **subito dopo `terminal`**; il
> **Web 1.0** (GeoCities/Netscape, metà anni '90) si inserisce **tra `pixel` e
> `winxp`**, colmando il buco tra l'era console/terminale e il desktop XP; il
> **Material Design** (2014) si inserisce **tra `skeuo` e `brutalism`**, raccontando
> la "grande appiattita" come reazione diretta allo skeuomorfismo che lo precede.
> L'unico candidato rimasto per future espansioni è il **Glassmorphism** come era
> autonoma (oggi `🟡` unito al 3D).

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
> (24×16) in DOM/CSS, camera che segue l'eroe (sprite a 4 direzioni con walk-cycle,
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
> *school* + chip certificazioni *verified*) e Lingue come **LinearProgress determinato** indaco +
> Conferenze con icona *mic*. **Contatti** come bottoni tonali. **FAB accent** circolare fisso
> (6dp→12dp in hover) con azione primaria *mailto*. **Ripple** autentico (azione `ripple`: cerchio
> che si espande dal punto del tocco) su tab, icon-button, contatti e FAB. Tipografia **Roboto**
> self-hostata (file variabile latin-subset, `fonts.css`). Hash `#material`, in `ERA_ORDER`
> **tra `skeuo` e `brutalism`**, label d'anno **"2014"**, cue audio (`case 'material'`): *tap*
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

## 7. Brutalismo — ✅ Implementato
**2017–2020** · `src/lib/themes/Brutalism.svelte`

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

> **Nota cronologica:** il Brutalismo (2017–2020) precede di poco l'esplosione del Bento
> (2021+), quindi in `ERA_ORDER` è collocato **prima di `bento`**. Le label d'anno mostrano
> "2017" (Brutalism) e "2015" (Modern Flat) — coerenti con l'avvio dei rispettivi trend.

---

## 8. Bento Box / Modern Flat — ✅ Implementato
**2021–oggi** · `src/lib/themes/BentoBox.svelte`

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

## 9. Glassmorphism — 🟡 Parziale (oggi unito al 3D)
**oggi – futuro prossimo** · attualmente dentro `src/lib/themes/ThreeD.svelte`

**Contesto.** Superfici di vetro traslucido sovrapposte (macOS Big Sur, Windows 11 Acrylic,
visionOS). Profondità eterea fatta di sfocature e luce, non di materiali reali.

**Stato.** Il linguaggio glassmorphism è **già presente** ma come veste dell'era Futuro/3D
(card semitrasparenti con `backdrop-filter: blur` sopra la scena WebGL), non come era a sé.

**Stile (se estratta come era autonoma).**
- **Palette:** gradienti morbidi sfumati come sfondo, pannelli traslucidi, bordi bianchi
  finissimi (`1px rgba(255,255,255,.3)`).
- **Tipografia:** moderna e leggera (Inter/SF), pesi sottili.
- **Materiali:** `backdrop-filter: blur`, saturazione, riflessi sottili, ombre diffuse.
- **Layout:** pannelli fluttuanti su sfondo colorato animato lentamente.

**Nota.** Se diventasse era autonoma andrebbe collocata **tra Bento e 3D** e differenziata
dal Futuro rimuovendo la scena WebGL (solo gradienti CSS animati sotto il vetro).

---

## 10. WebGL / 3D Immersivo — ✅ Implementato
**Il Futuro (2026+)** · `src/lib/themes/ThreeD.svelte`

**Contesto.** La frontiera: il browser come ambiente 3D immersivo. Padronanza tecnica come
messaggio. Elementi sospesi nello spazio, scena viva e reattiva.

**Stile.**
- **Palette:** background profondissimo, neon, glow; hue del torus knot che "respira".
- **Tipografia:** **Orbitron** (display futuristico), **Space Grotesk** (resto).
- **Materiali:** glassmorphism sopra scena WebGL, vignetta per leggibilità.
- **Layout:** card di vetro fluttuanti sopra canvas `fixed` a piena pagina.

**Interazione / narrativa.** Scena Three.js (nebulosa di particelle a 3 strati, torus knot
wireframe, anelli di energia, solidi orbitanti), parallasse camera col mouse, **bloom
reale** (`UnrealBloomPass`, gated), scena reattiva (hover card → energia che decade),
lazy-load di three, pausa rAF a tab nascosto, tilt 3D delle card.

---

## Idee oltre la lista (timeline futura)

- 🤖 **Era AI / conversazionale (2030+):** interfaccia chat/voce, il CV che si "auto-genera"
  rispondendo, UI generativa, glow morbido. Estende il concetto oltre il 3D — coda naturale
  della timeline.
- 🅰️ **Amiga Workbench / BBS / Teletext:** alternative di nicchia per il blocco anni '80-'90.
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
5. **Glassmorphism autonomo** — solo se si vuole separarlo dal 3D. **È ora l'unica proposta aperta.**
