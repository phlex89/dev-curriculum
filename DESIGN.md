---
name: Time-Machine Resume
description: Shell condivisa del CV a dodici ere — Timeline camaleonte, transizioni temporali, audio d'epoca
colors:
  accent-blue: "#0071e3"
  indigo-warp: "#4f46e5"
  cyan-flare: "#7df9ff"
  void-black: "#000000"
  glass-surface: "#FFFFFFB3"
  glass-border: "#FFFFFF66"
  node-idle: "#0000000D"
  node-hover: "#0000001A"
  hint-ink: "#14141EEB"
typography:
  label:
    fontFamily: "Space Grotesk, -apple-system, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 600
  hint:
    fontFamily: "Space Grotesk, -apple-system, sans-serif"
    fontSize: "0.85rem"
    fontWeight: 400
rounded:
  pill-container: "40px"
  pill-node: "30px"
  circle: "50%"
  none: "0"
spacing:
  container-pad-y: "8px"
  container-pad-x: "16px"
  node-pad-idle: "8px 12px"
  node-pad-active: "8px 20px"
  edge-inset: "20px"
components:
  timeline-container:
    backgroundColor: "{colors.glass-surface}"
    rounded: "{rounded.pill-container}"
    padding: "8px 16px"
  node-pill:
    backgroundColor: "{colors.node-idle}"
    rounded: "{rounded.pill-node}"
    padding: "8px 12px"
  node-pill-active:
    backgroundColor: "{colors.accent-blue}"
    textColor: "#ffffff"
    rounded: "{rounded.pill-node}"
    padding: "8px 20px"
  audio-fab:
    backgroundColor: "{colors.glass-surface}"
    rounded: "{rounded.circle}"
    size: "42px"
---

# Design System: Time-Machine Resume

> **Scope.** Questo file documenta la **shell condivisa** (Timeline, transizione d'era, audio FAB, boot, SEO layer). Le identità visive delle dodici ere sono deliberatamente dodici sistemi separati: la fonte normativa per-era è **[ERE.md](./ERE.md)** (catalogo stilistico) con il dettaglio implementativo in **[AGENTS.md](./AGENTS.md)**. Niente di ciò che segue va applicato *dentro* un tema d'era.

## 1. Overview

**Creative North Star: "Il Museo Vivente della UI"**

Le dodici ere sono sale espositive perfettamente ricostruite; la shell è il corridoio che le collega. Ma è un corridoio **camaleonte**: quando entri in una sala, la cornice stessa si traveste — la Timeline diventa fosfori verdi nel Terminale, bevel `outset` in Windows XP, vetro smerigliato nel Glassmorphism. L'immersione totale vince sempre sulla riconoscibilità della cornice. La shell "nuda" (pillola glass su nero, accento `#0071e3`) esiste solo come stato base da cui ogni era parte.

Il sistema rifiuta esplicitamente (da PRODUCT.md): il template CV/portfolio generico, la demo tecnica dove i contenuti sono pretestuosi, la parodia retrò low-effort. La shell non deve mai avere più personalità dell'era che incornicia — e mai meno fedeltà.

**Key Characteristics:**
- Timeline pillola flottante in basso, unico elemento persistente cross-era, riskinnata via class-switch `theme-{id}`
- Transizioni direzionali "viaggio nel tempo": bloom in avanti (680ms), glitch CRT all'indietro (520ms)
- Primo paint gated dal flag `booted`: nessun flash del tema di default
- Audio sintetizzato al volo (Web Audio), opt-in, muto di default
- Doppia modalità Timeline: pillola estesa / stepper compatto con sheet modale (fit-detection via ResizeObserver)
- Layer SEO semantico invisibile (`.sr-only`) che specchia `cv-data.ts`

## 2. Colors

Palette della shell nuda: superficie glass neutra su nero assoluto, un solo accento blu con coda indaco→ciano per il movimento.

### Primary
- **Accent Blue** (#0071e3): focus ring, pillola attiva, inizio dei gradienti di progresso e caricamento. È la voce della shell quando nessuna era la sta travestendo.

### Secondary
- **Indigo Warp** (#4f46e5): fine gradiente della load-bar e della fill Timeline, `theme-color` meta. Appare solo accanto all'Accent Blue, mai da solo.
- **Cyan Flare** (#7df9ff): coda del gradiente della load-bar. Solo per stati di movimento/caricamento.

### Neutral
- **Void Black** (#000000): sfondo `body` globale — il "buio del museo" tra una sala e l'altra durante il cross-fade.
- **Glass Surface** (#FFFFFFB3 ≈ rgba(255,255,255,.7)): contenitore Timeline e audio FAB a riposo.
- **Glass Border** (#FFFFFF66), **Node Idle** (#0000000D), **Node Hover** (#0000001A): micro-gerarchia interna della pillola.
- **Hint Ink** (#14141EEB): bolla del tooltip first-visit.

### Named Rules
**The Chameleon Rule.** Ogni era DEVE riskinnare Timeline e audio FAB con un blocco `.theme-{id}` esplicito. Una nuova era senza skin della shell è incompleta: la pillola glass di default dentro il Televideo è un errore, non un fallback.

## 3. Typography

**Display/Label Font:** Space Grotesk (fallback -apple-system, sans-serif) — preloaded in `app.html` perché sempre a schermo
**Body Font:** nessuno proprio — la shell eredita; ogni era impone il suo (Bedstead, Press Start 2P, Roboto, Fraunces, ecc., tutti self-hosted e subsettati in `src/lib/fonts.css`)

**Character:** la shell parla il meno possibile; la sua unica voce tipografica (hint bubble, label) è un grottesco geometrico neutro che le ere sovrascrivono via `.theme-X .label-text` (Courier per il Terminale, Press Start 2P per il Pixel, ecc.).

### Hierarchy
- **Label** (600, 0.9rem): testo della pillola attiva della Timeline; le altre ere mostrano solo l'icona.
- **Hint** (400, 0.85rem): tooltip first-visit sopra la Timeline.

### Named Rules
**The Subset Rule.** Ogni webfont d'era è self-hosted, `font-display: swap`, subsettato latin con `unicode-range` (eccezione documentata: Bedstead, che richiede i block glyphs teletext). Un font caricato da CDN o non subsettato è vietato.

## 4. Elevation

La shell usa ombre morbide ambient su un solo livello di profondità: la pillola flotta sul contenuto dell'era, senza layering tonale. La profondità *narrativa* è affidata alla sovrapposizione dei layer di transizione, governata da una scala z-index esplicita: `9990` fx-overlay < `9995` load-bar < `9998` scrim/backdrop < `9999` Timeline + audio FAB < `10000` era-sheet.

### Shadow Vocabulary
- **Ambient container** (`box-shadow: 0 10px 30px rgba(0,0,0,.1)`): Timeline a riposo; variante `.12` per l'audio FAB.
- **Active glow** (`box-shadow: 0 4px 15px rgba(0,113,227,.4)`): pillola attiva — l'ombra prende il colore dell'accento.

### Named Rules
**The One-Float Rule.** La shell ha un solo piano di elevazione: tutto ciò che le appartiene flotta alla stessa quota sopra l'era. Le ombre interne alle ere seguono le regole della propria epoca (elevazione Material, ombre dure brutaliste, ecc.), mai queste.

## 5. Components

### Timeline (signature component)
- **Shape:** pillola (`border-radius: 40px`), nodi interni pillola (`30px`)
- **Modalità:** estesa (tablist con 12 tab, icona+anno; label solo sull'attiva) / compatta (stepper `◄ era ►` + sheet modale) — scelta via ResizeObserver, phones ≤600px sempre compatta
- **Active:** fill di progresso `--fill: activeIndex/(length-1)`, gradiente accent; pillola attiva `#0071e3` con glow
- **Hover:** `0.4s cubic-bezier(.175,.885,.32,1.275)` (molla con overshoot); hover/focus su un nodo fa prefetch del chunk dell'era
- **Keyboard:** frecce/Home/End ciclano i tab, Escape chiude lo sheet
- **Skin per-era:** blocco `:global(:root) .theme-{id} …` hand-written per ognuna delle 12 ere

### Audio FAB
- **Shape:** cerchio 42×42px, inset 20px bottom-left (top-right ≤720px)
- **Stato:** 🔊/🔇, preferenza in `localStorage['cv_audio']`, muto di default
- **Skin per-era:** stesso pattern class-switch della Timeline (attualmente palette duplicata a mano — vedi Don'ts)

### Era-transition overlay
- **Forward:** bloom bianco/blu 680ms `cubic-bezier(.22,1,.36,1)`, `mix-blend-mode: screen`
- **Backward:** glitch CRT verde 520ms `steps(8,end)`
- **Cross-fade dei layer:** in 600ms (delay 260ms) / out 460ms
- **Reduced-motion:** overlay `display:none`, nessun fx JS

### Load bar
- Gradiente `#0071e3 → #4f46e5 → #7df9ff`, top, appare solo se il chunk tarda >220ms

## 6. Do's and Don'ts

### Do:
- **Do** aggiungere una nuova era in TUTTI i punti sincronizzati: `store.ts` (`THEMES`, `ERA_ORDER`), `Timeline.svelte` (array `themes`), `+page.svelte` (validatore hash, `eraLabels`, skin `.audio-fab.theme-X`), `registry.ts`, più skin Timeline — e verificare `npm run check` a 0 errori.
- **Do** gated ogni animazione con `prefers-reduced-motion` sia lato JS (helper `prefersReduced()`) sia lato CSS (`@media` mirror), con un'alternativa completa e dignitosa.
- **Do** avvolgere ogni accesso a `localStorage` in `try/catch` (chiavi: `cv_theme`, `cv_audio`, `cv_seen_timeline`).
- **Do** sintetizzare l'audio con Web Audio API al volo: zero file audio scaricati.
- **Do** rispettare la scala z-index documentata (9990–10000); nuovi layer si inseriscono nominandola, non inventando 99999.

### Don't:
- **Don't** costruire nulla che somigli a un **template CV/portfolio generico** (hero + card grid + timeline verticale): è l'anti-reference n.1 di PRODUCT.md.
- **Don't** far diventare la shell una **demo tecnica fine a sé stessa**: ogni effetto della cornice serve la narrazione del viaggio nel tempo, mai se stesso.
- **Don't** introdurre nostalgia da **parodia/meme retrò low-effort**: le skin d'epoca della Timeline seguono la stessa fedeltà storica delle ere (bevel veri, fosfori veri).
- **Don't** duplicare ulteriormente le palette per-era della shell: la doppia codifica manuale Timeline/audio-FAB è un debito noto, non un pattern da estendere.
- **Don't** caricare webfont non subsettati o da CDN, né import statici di Three.js/Lenis (solo `await import()`).
- **Don't** usare CSS custom properties per le skin d'era della Timeline senza rifattorizzare entrambe le superfici insieme (Timeline + FAB): metà migrazione è peggio di nessuna.
