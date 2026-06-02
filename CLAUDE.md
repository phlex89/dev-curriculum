Vedi [AGENTS.md](./AGENTS.md) per la documentazione completa del progetto e i dettagli sull'architettura, le tecnologie e le caratteristiche delle sette "ere" temporali implementate (Terminale, Pixel Art, Windows XP, Skeuomorfismo, Brutalismo, Bento Box, 3D/Futuro).

Vedi [MIGLIORAMENTI.md](./MIGLIORAMENTI.md) per il piano di miglioramenti estetici/UX e lo **stato di avanzamento** (Fasi 1–3 completate; backlog residuo annotato voce per voce con `✅`/`🟡`/`⬜`).

Vedi [ERE.md](./ERE.md) per il **catalogo stilistico & contestuale delle ere** (sia quelle già implementate sia le **proposte** non ancora realizzate, ognuna con stato `✅`/`🟡`/`⬜`, identità visiva e contesto storico). È il riferimento da consultare/aggiornare quando si valuta o si aggiunge una nuova era.

> **Era Pixel Art / 8-bit Gaming — ✅ implementata** (`src/lib/themes/PixelArt.svelte`, chiave tema `'pixel'`, hash `#pixel`, in `ERA_ORDER` subito dopo `terminal`). **Mini-gioco top-down (RPG overworld) esplorabile** stile *Zelda/Pokémon 8-bit*: mappa a tile 24×16 in DOM/CSS (densità pixel `--px = tile/16`), camera che segue l'eroe (sprite 4 direzioni, asset CSS originali), sei zone-edificio disposte come **viaggio sinistra→destra** in ordine narrativo lungo una **strada serpeggiante** → `cv-data.ts`, dialog box NES con intro typewriter (chiuso da **Invio**/`Esc`), HUD quest log `★ n/6` + `QUEST COMPLETE`. Palette NES satura, font *Press Start 2P*, `image-rendering: pixelated`, chiptune in `audio.ts`. **Doppio binario sempre attivo** (click diretto sulla zona / "MOSTRA TUTTO") e gated da `prefers-reduced-motion` (directory statica di pulsanti → nessun vicolo cieco); **solo asset originali**. **Easter egg** (gated da `prefers-reduced-motion`): Konami code → modalità notte, bump+idle, pesca allo stagno, monete → zona segreta "Scheda Eroe" RPG (statistiche derivate da `cv-data.ts`). Scheda completa in `ERE.md` §2.
>
> **Prossima era proposta — Web 1.0 / HTML Puro** (⬜ non ancora implementata). Metà anni '90: GeoCities, HTML senza CSS, `<marquee>`/`<blink>`, GIF "Under Construction", tabelle per il layout, Times New Roman. Colma il buco più ampio della timeline (tra Pixel/Terminale e XP). Scheda in `ERE.md` §3.

## Convenzioni chiave
- **Fonte di verità unica**: tutti i contenuti del CV vivono in `src/lib/cv-data.ts`. I temi pescano da lì — **non duplicare** testi nei componenti.
- **Isolamento per-tema**: ogni era è un componente Svelte autonomo in `src/lib/themes/` (`Terminal`, `PixelArt`, `WinXP`, `Skeuo`, `Brutalism`, `BentoBox`, `ThreeD`), con logica e CSS propri. La Timeline (`src/lib/components/Timeline.svelte`) inietta stile globale per-tema.
- **Stato tema**: `src/lib/store.ts` (`currentTheme`) persiste in `localStorage` (`cv_theme`) ed è sincronizzato con l'hash dell'URL (deep-link `#terminal`/`#pixel`/`#winxp`/`#skeuo`/`#brutalism`/`#bento`/`#threed`). `ERA_ORDER` definisce l'ordine cronologico (per la transizione direzionale). Il primo paint è gated da un flag `booted` in `+page.svelte`: finché l'era reale non è risolta dall'hash/`localStorage` non si renderizza nulla, così non si vede il flash del tema di default né parte l'FX al boot — solo un fade-in pulito.
- **`prefers-reduced-motion`**: ogni animazione introdotta deve passare da questo filtro (già adottato ovunque).
- **Three.js è lazy**: in `ThreeD.svelte` usare solo `import type` + `await import('three')`; mai import statico (manterrebbe il bundle WebGL nel chunk iniziale).

## Comandi
- `npm run dev` — sviluppo.
- `npm run build` — build di produzione.
- `npm run check` — type-check (svelte-check). **Gate di qualità: 0 errori** prima di considerare un lavoro concluso.
