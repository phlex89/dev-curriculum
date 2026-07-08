Vedi [AGENTS.md](./AGENTS.md) per la documentazione completa del progetto e i dettagli sull'architettura, le tecnologie e le caratteristiche delle undici "ere" temporali implementate (Terminale, Televideo, Pixel Art, Web 1.0, Windows XP, Skeuomorfismo, Material Design, Brutalismo, Bento Box, Glassmorphism, 3D/Futuro).

Vedi [MIGLIORAMENTI.md](./MIGLIORAMENTI.md) per il piano di miglioramenti estetici/UX e lo **stato di avanzamento** (Fasi 1–3 completate; backlog residuo annotato voce per voce con `✅`/`🟡`/`⬜`).

Vedi [ERE.md](./ERE.md) per il **catalogo stilistico & contestuale delle ere** (sia quelle già implementate sia le **proposte** non ancora realizzate, ognuna con stato `✅`/`🟡`/`⬜`, identità visiva e contesto storico). È il riferimento da consultare/aggiornare quando si valuta o si aggiunge una nuova era.

> **Era Pixel Art / 8-bit Gaming — ✅ implementata** (`src/lib/themes/PixelArt.svelte`, chiave tema `'pixel'`, hash `#pixel`, in `ERA_ORDER` subito dopo `terminal`). **Mini-gioco top-down (RPG overworld) esplorabile** stile *Zelda/Pokémon 8-bit*: mappa a tile 24×16 in DOM/CSS (densità pixel `--px = tile/16`), camera che segue l'eroe (sprite 4 direzioni, asset CSS originali), sei zone-edificio disposte come **viaggio sinistra→destra** in ordine narrativo lungo una **strada serpeggiante** → `cv-data.ts`, dialog box NES con intro typewriter (chiuso da **Invio**/`Esc`), HUD quest log `★ n/6` + `QUEST COMPLETE`. Palette NES satura, font *Press Start 2P*, `image-rendering: pixelated`, chiptune in `audio.ts`. **Doppio binario sempre attivo** (click diretto sulla zona / "MOSTRA TUTTO") e gated da `prefers-reduced-motion` (directory statica di pulsanti → nessun vicolo cieco); **solo asset originali**. **Easter egg** (gated da `prefers-reduced-motion`): Konami code → modalità notte, bump+idle, pesca allo stagno, monete → zona segreta "Scheda Eroe" RPG (statistiche derivate da `cv-data.ts`). Scheda completa in `ERE.md` §2.
>
> **Era Web 1.0 / HTML Puro — ✅ implementata** (`src/lib/themes/Web1.svelte`, chiave tema `'web1'`, hash `#web1`, in `ERA_ORDER` **tra `pixel` e `winxp`**). **Home page GeoCities del 1996** in chrome **Netscape Navigator 3** "massimizzato" (title bar + throbber "N" animato, menu bar, toolbar bevel 3D, location bar `geocities.com/…`, status bar con meteora + testo scorrevole). Layout a **tabelle** (Site Map + card a barra teal), contenuti da `cv-data.ts`. Dettagli d'epoca in **CSS originale**: starfield tassellato, heading rainbow, banner Under Construction, **hit counter** odometer, **badge 88×31**, webring, marquee/blink/hr-3D. Tipografia di **sistema** (Times New Roman + Courier) → **nessun webfont**. **Easter egg**: guestbook funzionante + finto alert `[JavaScript Application]`, banner "1.000.000° visitatore", throbber → cue **modem 56k** (`web1Modem` in `audio.ts`), **sparkle cursor trail** (pointer fine). Tutto gated da `prefers-reduced-motion`; mobile con chrome collassato. Scheda completa in `ERE.md` §3.
>
> **Era Material Design & Flat — ✅ implementata** (`src/lib/themes/Material.svelte`, chiave tema `'material'`, hash `#material`, in `ERA_ORDER` **tra `skeuo` e `brutalism`**). La "grande appiattita" 2014–2017 (Google Material + iOS 7): **app bar estesa indaco** (elevazione 4dp) con avatar/nome/ruolo/tagline/place-chip + icon-button contatti, **tab strip sticky** con **ink-bar accent scorrevole** + **scroll-spy** (click→scroll fluido, scroll→tab sincronizzata), **card flat su `#fafafa` sollevate da ombre di elevazione** (token 2/4/6/8/12dp, hover→8dp), esperienze con avatar-monogramma colorato + highlight a spunta + tech-chip, competenze in **chip tonali**, lingue come **LinearProgress determinato**, **FAB accent** (6→12dp, azione *mailto*) e **ripple** autentico su tab/icon-button/contatti/FAB. Tipografia **Roboto** self-hostata (file variabile latin-subset in `fonts.css` + `/static/fonts/roboto.woff2`), cue audio `case 'material'` (tap sine pulito). Tutto gated da `prefers-reduced-motion`. **Differenziazione da Bento**: Material = superfici piatte + elevazione a ombre + ripple + ink-bar + accento forte (no vetro smerigliato / no bento-grid). Scheda completa in `ERE.md` §6.
>
> **Era Glassmorphism — ✅ implementata** (`src/lib/themes/Glass.svelte`, chiave tema `'glass'`, hash `#glass`, in `ERA_ORDER` **tra `bento` e `threed`**, label d'anno **"2020"**, icona 🧊). Il **presente luminoso** (macOS Big Sur / Windows 11 / iOS), differenziato dal 3D col principio **"Luce vs Buio"**: **nessun WebGL** — sfondo di **aurora-blobs pastello** (aqua/lilla/pesca/cielo/menta) su base chiara, sfocati e in **drift CSS lento** con **parallax 2D piatto** verso il cursore (no camera/prospettiva). **Vetro frosted presente** (`rgba(255,255,255,.45)` + `backdrop-filter: blur(30px) saturate(180%)`, bordo-luce 1px inset, ombra ambient) con **sheen speculare** che segue il cursore (via action `tilt`, `mix-blend-mode: overlay`). Tipografia **Outfit ultralight** (geometrico arioso self-hostato `~34KB`, variable `wght 100–900`; ≠ Orbitron del 3D). Layout a pannelli fluttuanti (hero → Profilo → Esperienza → Competenze/Lingue → Formazione/Conferenze), contenuti da `cv-data.ts`. Cue audio `case 'glass'`: **campanella di vetro** cristallina (≠ drone scuro del 3D). Tutto gated da `prefers-reduced-motion`. Scheda completa in `ERE.md` §9.
>
> **Era Teletext / Televideo — ✅ implementata** (`src/lib/themes/Teletext.svelte`, chiave tema `'teletext'`, hash `#teletext`, in `ERA_ORDER` **subito dopo `terminal`**, label d'anno **"1984"**, icona 📺). **Televideo RAI / Ceefax** (testo trasmesso via TV): schermo nero **40 colonne** in una "stanza buia" (`radial-gradient`), bordo CRT + scanline, **header blu** con numero pagina (giallo) + nome (ciano) + `TELEVIDEO` + **orologio broadcast live** (verde, `setInterval`). **Magazine a pagine numerate** → `cv-data.ts`: 100 indice (mosaico TV a blocchi CSS + indice cliccabile + gag CONCEAL), 101 profilo, 102 esperienza (dettagli 110+), 103 origini, 104 competenze, 105 lingue, 106 formazione, 107 conferenze, 108 contatti (+download PDF), **777 segreta** (oroscopo del frontend + battuta nascosta). **Doppio binario**: digitazione **3 cifre** (buffer in header + beep `teletextBeep`) **+** tastierino on-screen, indice cliccabile, **4 tasti FASTEXT colorati** (rosso/verde/giallo/ciano), ◄/► prev-next, tasto **SVELA** (`R`) per il reveal televideo. **8 colori puri** su nero (blu alzato a `#6c7bff` per leggibilità), **titoli a doppia altezza**, **barra rainbow** a mosaico. Font **Bedstead** (ricostruzione del char-ROM SAA5050 di Ceefax/Televideo, **pubblico dominio**, self-hostato/subsettato `~7KB` in `fonts.css` + `/static/fonts/bedstead.woff2`, range peso `400 700`; fallback JetBrains Mono — unica era d'epoca con webfont, perché nessun SO ha un font teletext). Cue audio `case 'teletext'` (doppio blip secco, ≠ CRT terminale) + flicker "page rolling-in", gated da `prefers-reduced-motion`. **Differenziazione dal Terminale**: colori a blocchi + griglia TV + navigazione a numero di pagina vs riga di comando verde monocromatica. Scheda completa in `ERE.md` §13.
>
> **Era Parallax / Immersive Scroll — ✅ implementata** (`src/lib/themes/Parallax.svelte`, chiave tema `'parallax'`, hash `#parallax`, in `ERA_ORDER` **tra `brutalism` e `glass`**, label d'anno **"2018"**, icona 🎬). Il **web premium "craft"** contemporaneo (stile *synthesis.capital* / *tresmarescapital.com*): il sito diventa un'**esperienza cinematografica da scrollare**, dove **lo scroll è il regista** e l'**estetica è la protagonista** (contenuti = sottoinsieme curato di `cv-data.ts`; formazione/conferenze/lingue restano nelle altre ere). **Smooth-scroll con inerzia** via **Lenis** (~3KB, lazy come Three, spento sotto reduced-motion); **parallax multi-piano** + **reveal coreografati** (nome/manifesto a **parole mascherate**, **righe esperienza che entrano alternando lato**, statement con keyword evidenziate in terracotta). **7 scene**: hero con **composizione astratta animata** (anelli orbitali, diamante, orb, dot, "+" su più piani), profilo-manifesto, percorso (index editoriale + hover micro-dettaglio), **numeri in cifre** (sezione *pinned* con **contatori animati** da `cv-data.ts`: anni dal 2011/prodotti/settori, da `keyFigures`), competenze (**marquee cinetico**), ritratto (avatar **duotone**), CTA (bottoni **magnetici** + contatti reali). **Cursore custom**, barra di **progresso**, **indice a puntini** cliccabile, **auto-scroll "▶ Play"** opzionale. Serif display **Fraunces** self-hostato/subsettato (`fonts.css` + `/static/fonts/fraunces.woff2`, ~67KB, variabile opsz/wght; corpo in **Inter**). Cue audio `case 'parallax'` (**swell aereo ascendente**, ≠ campanella Glass / drone 3D). **Doppio binario** `prefers-reduced-motion`: scroll verticale statico, marquee → **lista skill accessibile**, niente parallax/auto-scroll/cursore — contenuti sempre integri. Scheda completa in `ERE.md` §15.
>
> **Prossima era proposta — AI / Conversazionale** (⬜ §11): l'unica vera nuova frontiera narrativa oltre il 3D (agente deterministico `cv-data.ts`-driven). Andrebbe **in coda a `ERA_ORDER`**, dopo `threed`. Scheda in `ERE.md` §11.

## Convenzioni chiave
- **Fonte di verità unica**: tutti i contenuti del CV vivono in `src/lib/cv-data.ts`. I temi pescano da lì — **non duplicare** testi nei componenti.
- **Isolamento per-tema**: ogni era è un componente Svelte autonomo in `src/lib/themes/` (`Terminal`, `Teletext`, `PixelArt`, `Web1`, `WinXP`, `Skeuo`, `Material`, `Brutalism`, `BentoBox`, `Parallax`, `Glass`, `ThreeD`), con logica e CSS propri. La Timeline (`src/lib/components/Timeline.svelte`) inietta stile globale per-tema.
- **Stato tema**: `src/lib/store.ts` (`currentTheme`) persiste in `localStorage` (`cv_theme`) ed è sincronizzato con l'hash dell'URL (deep-link `#terminal`/`#teletext`/`#pixel`/`#web1`/`#winxp`/`#skeuo`/`#material`/`#brutalism`/`#bento`/`#parallax`/`#glass`/`#threed`). `ERA_ORDER` definisce l'ordine cronologico (per la transizione direzionale). Il primo paint è gated da un flag `booted` in `+page.svelte`: finché l'era reale non è risolta dall'hash/`localStorage` non si renderizza nulla, così non si vede il flash del tema di default né parte l'FX al boot — solo un fade-in pulito.
- **`prefers-reduced-motion`**: ogni animazione introdotta deve passare da questo filtro (già adottato ovunque).
- **Three.js è lazy**: in `ThreeD.svelte` usare solo `import type` + `await import('three')`; mai import statico (manterrebbe il bundle WebGL nel chunk iniziale).

## Comandi
- `npm run dev` — sviluppo.
- `npm run build` — build di produzione.
- `npm run check` — type-check (svelte-check). **Gate di qualità: 0 errori** prima di considerare un lavoro concluso.

<!-- PROMPTOPS:CONTEXT -->

# Project Context (auto-generated by PromptOps)

Use this context to navigate the project efficiently.
Do NOT re-read files listed here unless you need their full content.

A detailed JSON project map is available at `.promptops/project-context.json` — consult it for structured project metadata.

## Project
- **Name**: dev-curriculum
- **Framework**: svelte (typescript)
- **Version**: ^5.55.2
- **Domains**: routes

## Directory Structure
```
nuxt_backup/
  app/
    assets/
      css/
    components/
      ... (1 more files)
    pages/
      ... (1 more files)
    ... (1 more files)
  public/
    ... (2 more files)
  nuxt.config.ts
  package.json
  README.md
  tsconfig.json
  ... (1 more files)
scripts/
  ... (1 more files)
src/
  lib/
    actions/
      ... (2 more files)
    components/
      ... (2 more files)
    themes/
      winxp/
      ... (13 more files)
    ... (5 more files)
  routes/
    ... (3 more files)
  ... (2 more files)
static/
  fonts/
    ... (15 more files)
  wallpapers/
    ... (12 more files)
  ... (12 more files)
CLAUDE.md
package.json
README.md
svelte.config.js
tsconfig.json
vite.config.ts
```

## Recently Changed Files
These files were modified in recent commits — likely relevant to current work:
- `.gitignore`
- `AGENTS.md`
- `CLAUDE.md`
- `ERE.md`
- `package-lock.json`
- `package.json`
- `src/app.html`
- `src/lib/components/SeoContent.svelte`
- `src/lib/cv-data.ts`
- `src/lib/themes/BentoBox.svelte`
- `src/lib/themes/Brutalism.svelte`
- `src/lib/themes/Glass.svelte`
- `src/lib/themes/Material.svelte`
- `src/lib/themes/Parallax.svelte`
- `src/lib/themes/PixelArt.svelte`

<!-- /PROMPTOPS:CONTEXT -->
