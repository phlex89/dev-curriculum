# Piano di ottimizzazione performance — Time-Machine Resume

> Documento vivo. Analisi e piano di miglioramento delle performance di caricamento e
> runtime. Stato verificato sul build di produzione il **2026-06-02**.
>
> Marcatori di stato: `✅` fatto · `🟡` parziale · `⬜` non ancora implementato.
> Effort: 🟢 quick win · 🟡 medio · 🔴 importante/architetturale.
> Impatto: ⭐ basso · ⭐⭐ medio · ⭐⭐⭐ alto.
>
> **Aggiornamento 2026-06-02 — P1→P5 tutte implementate** (`npm run build` + `npm run check`
> = 0 errori). Risultati misurati in fondo, sezione **Risultati**.

---

## Stato attuale (misurato)

| Risorsa | Situazione | Verdetto |
|---|---|---|
| **Three.js** | 708 KB in chunk separato, caricato con `await import('three')` solo in `ThreeD.svelte` | ✅ già lazy, fatto bene |
| **7 temi** | Tutti importati staticamente in `+page.svelte` → finiscono **tutti** in un unico chunk: `nodes/2.js` = **104 KB JS (30 KB gz) + 88 KB CSS (16 KB gz)** | ❌ il visitatore vede *una* era ma scarica tutte e 7 (incluso il mini-gioco PixelArt da 64 KB) |
| **Font** | 1 `<link>` Google Fonts render-blocking con **9 famiglie / ~22 file** (Anton, Archivo×3, JetBrains×3, Press Start 2P, Silkscreen×2, Space Grotesk×4, Space Mono×2, Inter×4, Orbitron×2) | ❌ ogni era ne usa 1-2; le scarica tutte all'avvio |
| **Wallpaper Bliss** (WinXP) | Già responsive via media-query su `background-image` (296 KB → 1.2 MB per DPI), scaricato solo quando WinXP è attivo | 🟡 tecnica ok, ma JPG non ottimizzati, niente WebP/AVIF |
| **og-image.png** | 320 KB | 🟡 solo per crawler social, non blocca il load |
| **avatar.svg** | 4 KB | ✅ |
| `display=swap` | presente nel link font | ✅ |

**Diagnosi in una riga:** Three.js è già lazy, ma **i 7 temi e i 9 font no** — ogni
visitatore paga per tutte le ere anche se ne guarda una. Questi sono i due interventi
ad alto impatto.

---

## Interventi (per priorità)

### 🔴 P1 — Code-splitting dei temi · ⭐⭐⭐ · ✅

**Problema:** gli `import` statici in `+page.svelte` (righe 9-15) costringono Vite a
mettere tutti e 7 i temi + CSS nello stesso chunk del nodo pagina.

**Intervento:** sostituire gli import statici con `import()` dinamici risolti sul tema
attivo (Svelte `<svelte:component>` o `{#await}`), oppure una mappa
`Record<Theme, () => import(...)>`. Ogni era diventa il proprio chunk JS+CSS, caricato
solo quando selezionata. Va gestito il gate `booted` esistente in `+page.svelte`.

**Prefetch:** dell'era adiacente sulla timeline (on hover) per mantenere le transizioni
istantanee.

**Impatto stimato:**
- Bundle iniziale prima era: da ~46 KB gz (tutti i temi) → **~8-12 KB gz** (solo Terminal + Timeline).
- Il chunk PixelArt da 64 KB scaricato solo se si va su `#pixel`.

**Costo:** primo paint di una nuova era leggermente ritardato la prima volta (un `await`).
Mitigabile con prefetch + skeleton.

**✅ Implementato:** mappa `themeLoaders` in `src/lib/themes/registry.ts`
(`Record<Theme, () => import(...)>`); `+page.svelte` renderizza l'era attiva via
`{#await themeLoaders[displayedTheme]()}`. Prefetch su hover/focus dei pulsanti della
Timeline (`prefetchTheme`) + warm dei due vicini cronologici al boot via
`requestIdleCallback`. Il gate `booted` è preservato. **Misurato:** il nodo pagina è
sceso da **112.7 KB (33.1 KB gz)** → **7.7 KB (3.3 KB gz)**; ogni era è ora un chunk
JS+CSS a sé (PixelArt CSS 28 KB caricato solo su `#pixel`).

**Load-before-swap (per nascondere il caricamento):** `+page.svelte` tiene una
`displayedTheme` che *ritarda* `$currentTheme` — quando si sceglie un'era nuova, l'era
corrente resta a schermo finché il chunk della nuova è caricato, poi avviene il
cross-fade. Così la transizione anima sempre tra due layer *reali* (mai un layer vuoto in
fade) e resta istantanea per le ere già in cache/prefetchate. La pill della Timeline segue
`$currentTheme` subito (feedback immediato al click); FX di "viaggio nel tempo" e audio
partono sullo swap reale. Cross-fade allungato (out 460 ms / in 600 ms, delay 260 ms) per
allinearsi alla durata dell'FX. Barra di caricamento sottile in alto (`.load-bar`) che
compare solo se il load è davvero lento (fade-in ritardato di 220 ms → invisibile per gli
swap già pronti).

---

### 🔴 P2 — Font: caricamento per-era + self-hosting · ⭐⭐⭐ · ✅

**Problema:** un solo `<link>` render-blocking scarica 9 famiglie all'avvio.

**Decisione presa: self-hosting woff2.** Scaricare i woff2, servirli da `/static`,
eliminare i due `preconnect` e la dipendenza da `fonts.gstatic.com`. Definire
`@font-face` con `font-display: swap` ed eventuale `unicode-range`. `preload` solo del
font dell'era iniziale (risolta da hash/localStorage al boot). Tagliare i pesi non
realmente usati (verificare es. i 4 pesi di Space Grotesk / Inter).

**Mappatura font → era** (da subsettare):
- Terminal: JetBrains Mono
- Pixel Art: Press Start 2P, Silkscreen
- WinXP: Tahoma (di sistema, nessun download)
- Skeuo: di sistema (Lucida Grande / Georgia) — nessun download
- Brutalism: Anton, Archivo, Space Mono
- Bento: Inter, Space Grotesk
- ThreeD: Orbitron, Space Grotesk
- Timeline (sempre presente): Space Grotesk + i font delle ere per le label

**Impatto stimato:** togliere il render-blocking di 9 famiglie → **FCP/LCP −200/600 ms**
su rete media, e −centinaia di KB sul transfer iniziale.

**✅ Implementato:** woff2 self-hosted in `/static/fonts` (11 file, **186 KB** totali su
disco), `@font-face` con `font-display: swap` in `src/lib/fonts.css` (importato dal
`+layout.svelte`, sempre globale). **Subset latin-only** (sufficiente per l'italiano:
à è é ì ò ù stanno in U+00E0–00F9, coperti dal subset latin di Google) → eliminati i
subset cyrillic/greek/vietnamese/latin-ext. Le famiglie **variabili** (Inter, Space
Grotesk, Archivo, JetBrains Mono, Orbitron) servono **un solo file** ciascuna: ogni peso
punta allo stesso URL, quindi il browser lo scarica una volta sola (548 KB → 186 KB).
Rimossi `<link>` Google Fonts + i due `preconnect` da `app.html`; `preload` del solo
**Space Grotesk** (font della Timeline, sempre a schermo). Ogni altra famiglia è scaricata
lazy solo quando l'era che la usa renderizza testo.

---

### 🟡 P3 — Wallpaper WinXP: formati moderni · ⭐⭐ · ✅

**Problema:** JPG da 296 KB–1.2 MB. La media-query responsive è già corretta.

**Intervento:** generare varianti **WebP/AVIF** (riduzione tipica 30-50%) e servirle con
`image-set()` nel `background-image` + fallback JPG. Il download parte solo al primo
render della desktop (era WinXP attiva) — comportamento già corretto.

**Impatto:** sull'era WinXP, ~150-600 KB risparmiati per viewport. Nessun effetto sulle
altre ere.

**✅ Implementato:** generate varianti **WebP** (q80) e **AVIF** (q55) di tutte e 4 le
risoluzioni; servite via `image-set()` con ordine AVIF → WebP → JPG nelle media-query di
`WinXP.svelte`, con riga `background-image: url(...jpg)` di fallback per browser senza
`image-set()`. **Misurato per la variante 1366×768:** JPG 296 KB → WebP 80 KB → **AVIF
48 KB** (−84%); riduzioni analoghe sulle altre risoluzioni. Download solo al primo render
del desktop XP (comportamento già corretto).

---

### 🟡 P4 — og-image e asset social · ⭐ · ✅

`og-image.png` 320 KB → comprimere/ottimizzare (PNG ben compresso → ~80-120 KB). Non
impatta il caricamento pagina, solo le condivisioni social.

**✅ Implementato:** ricompresso con PNG a palette (quality 90, effort 10) → **325 KB →
75 KB** (−77%), verificato visivamente che gradienti e pannelli restino puliti (nessun
banding). Resta PNG per compatibilità con i crawler social.

---

### 🟢 P5 — Rifiniture · ⭐ · ✅

- **CSS critico:** ✅ dopo lo split P1 il CSS sempre-presente è solo `0.css` (layout +
  `@font-face`, 0.43 KB gz) + `2.css` (pagina + Timeline + audio fab, 2.88 KB gz); il CSS
  di ogni era è un chunk a parte caricato on-demand. Nessun CSS globale duplicato (i temi
  sono componenti con stile *scoped*).
- **`content-visibility: auto`** ✅ applicato a `.bru-section` (Brutalism) con
  `contain-intrinsic-size: auto 400px` (auto-correttivo → niente salti allo scroll-back).
  Skeuo/Bento **esclusi di proposito**: le loro box usano `use:reveal` + `use:tilt` su una
  griglia, dove `content-visibility` interferirebbe con l'intrinsic sizing del grid e con
  gli IntersectionObserver dei reveal.
- **Audio:** già ottimo — nessun intervento.
- **`will-change`:** ✅ `.glass-card` (ThreeD) spostato `will-change: transform` da base a
  `:hover` (i layer GPU non restano fissati sulle card a riposo). Restano legittimi i
  `will-change` su animazioni *infinite* (ticker Brutalism) e sull'overlay FX (rimosso dal
  DOM a fine animazione).
- **Preconnect:** ✅ i due `preconnect` a Google Fonts rimossi in P2.

---

## Riepilogo & ordine consigliato

| Priorità | Intervento | Effort | Impatto | Guadagno principale | Stato |
|---|---|---|---|---|---|
| 🔴 P1 | Code-split temi (import dinamici) | 🟡 | ⭐⭐⭐ | nodo pagina 33.1 → 3.3 KB gz | ✅ |
| 🔴 P2 | Font per-era + self-host woff2 + subset latin | 🟡 | ⭐⭐⭐ | no render-block; woff2 548 → 186 KB | ✅ |
| 🟡 P3 | Wallpaper WebP/AVIF + image-set | 🟢 | ⭐⭐ | 296 → 48 KB AVIF (−84%) per viewport | ✅ |
| 🟡 P4 | Ottimizzare og-image | 🟢 | ⭐ | 325 → 75 KB (−77%) | ✅ |
| 🟢 P5 | content-visibility, will-change, cleanup | 🟢 | ⭐ | micro-gain paint + GPU memory | ✅ |

**Ordine:** P1 → P2 → P3. P1 e P2 sono indipendenti e parallelizzabili.

**Gate di qualità:** dopo ogni intervento, `npm run build` + `npm run check` (0 errori)
e verifica visiva delle 7 ere + transizioni timeline.

---

## Risultati (misurati sul build 2026-06-02)

**Carico iniziale per l'era di default (Bento), gz:**
- *Prima:* nodo `2.js` = **33.1 KB** (tutti e 7 i temi + mini-gioco PixelArt) + `_page.css`
  **18.5 KB** (CSS di tutte le ere) + **9 famiglie font render-blocking** da
  `fonts.googleapis.com`.
- *Dopo:* nodo pagina `2.js` = **3.3 KB**; CSS sempre-presente `0.css` (0.43) + `2.css`
  (2.88) ≈ **3.3 KB**; il tema attivo è un chunk on-demand (es. `BentoBox.css` 2.61 KB gz).
  Font self-hosted, **nessun render-block**, solo Space Grotesk in `preload`.

**Asset:**
- woff2: **548 KB → 186 KB** su disco (subset latin + dedup font variabili), e solo i font
  dell'era attiva vengono effettivamente scaricati.
- Wallpaper WinXP (1366×768): **296 KB JPG → 48 KB AVIF** (fallback WebP 80 KB / JPG).
- `og-image.png`: **325 KB → 75 KB**.

**File toccati:** `src/lib/themes/registry.ts` (nuovo), `src/routes/+page.svelte`,
`src/routes/+layout.svelte`, `src/lib/components/Timeline.svelte`, `src/lib/fonts.css`
(nuovo) + `static/fonts/*.woff2`, `src/app.html`, `src/lib/themes/WinXP.svelte` +
`static/wallpapers/*.{webp,avif}`, `src/lib/themes/Brutalism.svelte`,
`src/lib/themes/ThreeD.svelte`, `static/og-image.png`.

**Gate:** `npm run build` ✅ · `npm run check` ✅ 0 errori.
