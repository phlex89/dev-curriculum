# Era "Liquid Glass" (2025) + ridisegno differenziante dell'era Glass

**Data:** 2026-08-30
**Stato:** design approvato, da implementare
**Origine:** analisi di *"New UX/UI Trends That Top Designers Are Switching To!"* (Punit Chawla,
Muzli, 30 luglio 2026). Dei nove trend dell'articolo, uno solo colma un buco reale della timeline
del progetto: **Liquid Glass Navigation**. Gli altri sono già coperti (`Parallax`, `ThreeD`),
inapplicabili a un CV (display-less UX, foldable, design sprint, tool di design) o narrativamente
deboli qui (gallery infinita).

---

## 1. Obiettivo

Aggiungere una **tredicesima era** — `liquid`, etichetta d'anno **2025** — collocata in
`ERA_ORDER` **tra `glass` (2020) e `threed` (2026)**, e insieme **rifocalizzare l'era `Glass`
esistente** così che le due non si sovrappongano.

Il rischio da neutralizzare è quello che `ERE.md` già annota per casi analoghi (Frutiger Aero vs
Skeuo): due ere che raccontano "vetro" e finiscono per somigliarsi. La risposta di questo design
non è cromatica ma **strutturale**.

---

## 2. Principio di differenziazione

`Glass` oggi **non ha alcuna navigazione**: è una griglia di sette pannelli frosted in un unico
scroll di pagina — un *documento*. Il trend descritto nell'articolo riguarda invece esattamente la
**navigazione** ("barra flottante che si dimentica durante lo scroll, collassabile, doppia sticky
bar impilata"). Da qui l'asse portante:

> **Glass = documento. Liquid = app.**

Storicamente corretto, per giunta: il glassmorphism 2020 è il linguaggio delle superfici di un *OS
desktop* (Big Sur, Windows 11 Acrylic); Liquid Glass 2025 è la grammatica di un'*app mobile*
(iOS 26).

| | **Glass — 2020** | **Liquid — 2025** |
|---|---|---|
| Principio ottico | **blur**: sfoca ciò che sta dietro | **lensing**: lo *piega*, comprime ai bordi, scompone i colori |
| Colore del vetro | lattiginoso, colorato di suo | quasi incolore, **prende colore dallo sfondo** |
| Sfondo | aurora pastello slavata | **wallpaper saturo e contrastato** (obbligatorio: una lente su fondo uniforme è invisibile) |
| Struttura | scroll unico di pagina, 7 pannelli | **app shell** con 4 schermate a tab |
| Navigazione | assente | **è il tema**: due barre impilate che collassano |
| Movimento | drift lento, easing | **molla**, con deformazione |
| Geometria | raggi medi (18px) | squircle larghi + capsule |
| Tipografia | Outfit peso 200, arioso | **font di sistema**, pesi medi, tracking stretto |
| Affordance dedicata | toggle ☀/☾ chiaro-scuro | **cambio wallpaper** (il vetro si ri-tinge) |
| Cue audio | campanella cristallina | **goccia** acquatica |
| Icona Timeline | 🧊 | 💧 |

---

## 3. Identità visiva dell'era Liquid

### 3.1 Ambiente

`static/wallpapers/` contiene solo Bliss (WinXP), quindi i wallpaper di Liquid sono **generati in
CSS puro** — mesh gradient saturi, ~0 KB, nessun asset aggiunto. Tre ambienti:

| Nome | Palette |
|---|---|
| **Aurora** | blu / violetto / magenta |
| **Sunset** | arancio / rosa / indaco |
| **Deep** | verde acqua / blu notte |

Un pulsante cicla i tre. Al cambio: il wallpaper esegue una transizione morbida, **il vetro si
ri-tinge** e l'accento dell'era (link, pillola attiva, capsule) si deriva dal wallpaper corrente.
Questa è l'affordance esclusiva di Liquid — sostituisce, senza duplicarlo, il toggle chiaro/scuro
che resta a Glass.

La scelta persiste in `localStorage` con chiave propria (`cv_liquid_wallpaper`), come già fa Glass
con `cv_glass_mode`.

### 3.2 Tipografia

**Nessun webfont.** Stack di sistema: `-apple-system, 'SF Pro Display', system-ui, 'Segoe UI
Variable', 'Segoe UI', sans-serif`. È l'unica era in cui il font di sistema *è* il font
storicamente corretto, aggiunge 0 KB, e resta l'opposto di Glass (Outfit 200) perché qui i pesi
sono 500–600 con tracking stretto (`letter-spacing: -0.02em` sui titoli).

### 3.3 Forma e movimento

- **Squircle a raggio largo** (28–34px) e **capsule** (`border-radius: 999px`) per barre, tab,
  chip e pulsanti.
- **Molla, non easing.** Le transizioni di stato usano una curva elastica
  (`cubic-bezier(0.34, 1.56, 0.64, 1)`); gli elementi in movimento **si deformano**: la pillola
  dell'indicatore si allunga nella direzione dello spostamento e rimbalza a destinazione.
- Si animano **solo `transform` e `opacity`**. `backdrop-filter` non si anima mai.

---

## 4. Struttura e navigazione

### 4.1 App shell

Layout ad altezza fissa `100dvh`: una **testata statica** (le due barre) e sotto **una sola regione
scrollabile** (la schermata attiva). Le barre **non sono mai `position: fixed`**.

Questa scelta non è stilistica: elimina per costruzione il bug noto di iOS Safari per cui
`backdrop-filter` su un elemento `fixed` provoca jank pesante allo scroll (l'area sfocata viene
ridipinta a ogni frame). Se la barra non è fissa, il bug non si presenta. In più è un'ulteriore
divergenza strutturale da Glass, che invece scrolla l'intera pagina.

### 4.2 Le quattro schermate

Sono i sette pannelli di Glass, raggruppati. Tutti i contenuti da `cv-data.ts` — nessun testo
duplicato nel componente.

| Tab | Contenuto |
|---|---|
| **Profilo** | avatar, `name`, `role`, `tagline`, `contact.location`, contatti a capsula (LinkedIn, email) |
| **Percorso** | `experience` + `earlyCareer` |
| **Competenze** | `skillGroups` + `languages` |
| **Altro** | `education` + `conferences` |

La SEO non ne risente: `SeoContent.svelte` pubblica già il CV completo come HTML prerenderizzato e
indicizzabile, indipendente dall'era attiva.

### 4.3 Le barre

**Due barre impilate** in cima, come la doppia sticky bar di Apple Music citata nell'articolo:

1. **striscia identità** — sottile, `name` · `role`, sempre visibile mentre si cambia schermata;
2. **tab bar a capsula** — le 4 voci con pillola indicatore che scivola deformandosi.

**Collasso.** Allo scroll dentro una schermata le due barre si contraggono in **un'unica capsula
compatta** (icona della tab attiva + etichetta breve); alla fine dello scroll si riespandono. È il
"low-key floating nav" dell'articolo preso alla lettera.

### 4.4 Collisioni con la chrome del sito — vincoli di posizionamento

La chrome globale è già occupata in basso e va rispettata:

- **Timeline**: `position: fixed; bottom: 20px; left: 50%; z-index: 9999` → **la navigazione di
  Liquid sta in alto.** Nessuna barra di Liquid può stare in basso al centro.
- **`LanguageSwitch`** (in basso a sinistra) e **audio FAB**: la regione dei contenuti tiene un
  padding inferiore ≥ 110px, come già fa Glass.
- Il **pulsante wallpaper** va in alto a destra; sotto i 720px l'audio FAB si sposta in alto a
  destra, quindi lì il pulsante wallpaper passa in alto a sinistra — stessa logica già presente in
  `Glass.svelte` per il toggle ☀/☾.

### 4.5 `prefers-reduced-motion`

Le tab **restano** (sono navigazione, non decorazione), ma:

- niente collasso delle barre: restano ferme ed estese;
- niente deformazione della pillola né molla: cambio di stato istantaneo o con dissolvenza breve;
- niente transizione animata tra schermate.

La lente resta attiva: è un effetto statico, non movimento. Contenuti sempre integri e raggiungibili.

### 4.6 Accessibilità

- Le tab usano `role="tablist"` / `role="tab"` / `role="tabpanel"`, con `aria-selected` e
  `aria-controls`.
- Navigazione da tastiera con frecce ←/→ tra le tab (pattern ARIA standard), `Home`/`End` agli
  estremi, focus visibile su ogni controllo.
- Il pulsante wallpaper espone `aria-label` e annuncia il wallpaper corrente.
- Contrasto del testo verificato su tutti e tre i wallpaper (il vetro deve restare leggibile anche
  sopra le zone più chiare del mesh gradient).

---

## 5. Tecnica del vetro

### 5.1 La lente

Filtro SVG con `feImage` + `feDisplacementMap`. La *displacement map* — immagine in cui i canali R
e G codificano lo spostamento orizzontale e verticale di ogni pixel — è **generata a runtime su
`<canvas>`** (256×128, spostamento derivato dalla distanza con segno da un rettangolo arrotondato:
forte verso l'esterno vicino al bordo, neutro al centro), convertita in data-URI e passata a
`feImage`. Costo: pochi millisecondi, una volta.

> **Requisito non ovvio:** la barra **cambia dimensione** (estesa ↔ collassata), quindi la mappa va
> **rigenerata a ogni cambio di geometria** (via `ResizeObserver`). Senza questo, la lente resta
> ancorata alla forma precedente e l'effetto si sfalda visibilmente.

### 5.2 Dispersione cromatica

Il displacement viene applicato tre volte con `scale` leggermente diverso per i canali R, G e B,
poi ricomposto. È ciò che produce l'iridescenza sul bordo — il dettaglio che nessun'altra era del
sito possiede.

### 5.3 Detection del motore

`@supports (backdrop-filter: url(#f))` **non è un gate valido**: la regola risulta sintatticamente
valida anche dove il filtro poi non produce alcun effetto. E non esiste modo di *misurare* a
runtime se il filtro abbia davvero spostato dei pixel. Resta il riconoscimento del motore:

```
navigator.vendor === 'Apple Computer, Inc.'   → WebKit  → fallback
CSS.supports('-moz-appearance', 'none')       → Gecko   → fallback
altrimenti                                     → Chromium → lente
```

`navigator.vendor` copre correttamente anche Chrome e Firefox su iOS, che sono WebKit sotto il
cofano.

È sniffing, ed è un compromesso consapevole e accettato. Viene reso **sicuro per costruzione**: il
**default è il fallback** e la lente è opt-in, così una detection errata degrada l'effetto senza
rompere nulla.

Supporto reale (verificato): [WebKit bug 245510](https://bugs.webkit.org/show_bug.cgi?id=245510)
aperto, [mdn/browser-compat-data #24110](https://github.com/mdn/browser-compat-data/issues/24110),
[richiesta su Mozilla Connect](https://connect.mozilla.org/t5/ideas/support-svg-filters-in-backdrop-filter-for-advanced-glass/idi-p/98453).

### 5.4 Fallback (trattato come seconda resa di serie A)

Su iPhone e iPad **ogni** browser usa WebKit: il fallback non è la coda del pubblico, è chiunque
apra il sito dal telefono. Va quindi curato, non subito:

- rim-light sul bordo a `conic-gradient`;
- doppia ombra `inset` ciano/magenta a simulare la dispersione;
- anello interno con `backdrop-filter: blur(2px) brightness(1.08) saturate(1.4)` in leggero `scale`,
  che finge la compressione ai bordi.

Su un wallpaper saturo la resa è convincente: non è la lente vera, ma è un vetro che nessun'altra
era del sito ha.

### 5.5 Budget di rendering

- La **lente vive solo sulle barre di navigazione** (uno, massimo due elementi).
- Le card usano un normale `backdrop-filter: blur() saturate()`.
- `will-change` solo durante l'interazione, mai permanente.
- `backdrop-filter` non viene mai animato.

---

## 6. Modifiche all'era `Glass`

Principio: **ogni effetto che diventa firma di Liquid esce da Glass.** Non è un impoverimento — il
glassmorphism del 2020 era CSS fermo, non superfici che rispondono al mouse. Quattro mosse isolate,
nient'altro:

1. **Rimuovere `use:tilt`** dai sette pannelli, la regola `.panel::after` dello sheen speculare che
   insegue il cursore, e l'import di `tilt`. (`reveal` resta.)
2. Rimuovere di conseguenza `transform-style: preserve-3d` e `will-change: transform`, che restano
   altrimenti senza scopo.
3. **Raggi**: `.panel` `26px → 18px`, `.exp-item` `16px → 12px`. Capsule e squircle larghi diventano
   un tratto esclusivo di Liquid.
4. **Pannelli più lattiginosi**: `--g-panel-bg` da `rgba(255,255,255,.45)` a `.58` (chiaro) e da
   `rgba(28,28,44,.45)` a `.55` (scuro). Il blur torna a essere *velo*, non lente.

Il toggle ☀/☾ **resta a Glass** (period-correct per Big Sur, ed è la sua affordance distintiva).
L'hover dei pannelli continua a passare a `--g-panel-shadow-hover`, già presente nel codice: i
pannelli si sollevano ancora, semplicemente non si inclinano più.

---

## 7. Integrazione

| File | Modifica |
|---|---|
| `src/lib/themes/Liquid.svelte` | **nuovo** — componente autonomo, logica e CSS propri |
| `src/lib/store.ts` | `Theme`, `THEMES`, `ERA_ORDER` → `'liquid'` tra `glass` e `threed` |
| `src/lib/era-meta.ts` | `{ id: 'liquid', label: 'Liquid Glass', year: '2025', icon: '💧' }` |
| `src/lib/themes/registry.ts` | loader lazy `() => import('./Liquid.svelte')` |
| `src/lib/audio.ts` | `case 'liquid'` |
| `src/lib/translations.ts` | `ui.it.liquid` + `ui.en.liquid` (il tipo `UiStrings` si estende da sé) |
| `src/lib/components/Timeline.svelte` | skin `.theme-liquid` (accanto a `.theme-glass` / `.theme-threed`) |
| `src/lib/components/LanguageSwitch.svelte` | skin `.theme-liquid` |
| `src/routes/+page.svelte` | `'liquid'` nella lista tema (riga ~143), skin `.audio-fab.theme-liquid` e `.timeline-scrim.theme-liquid` |
| `ERE.md` | nuova scheda §16 + riga nel quadro d'insieme + aggiornamento priorità |
| `CLAUDE.md` | paragrafo dell'era, nello stile degli altri |

Deep-link `#liquid`, coerente con le altre ere.

### 7.1 Audio

`case 'liquid'`: una **goccia** — sine breve con pitch che scende e risale di scatto mentre un
passa-basso si apre. Deve stare lontano sia dalla campanella cristallina di `glass` sia dal drone
scuro di `threed`: acquatico, non cristallino.

### 7.2 i18n

Nuove stringhe in entrambe le lingue: etichette delle 4 tab, nomi dei 3 wallpaper, `aria-label` del
pulsante wallpaper e delle tab. `Liquid Glass` funziona identico in IT ed EN, quindi non serve un
override in `eraNames`.

Come tutte le ere, il componente legge lingua e dati **una volta all'init**
(`const cvData = getCvData()`): viene rimontato a ogni switch grazie al `{#key}` in `+page.svelte`.

---

## 8. Criteri di accettazione

1. **Screenshot di `#glass` (chiaro e scuro) presi PRIMA di qualunque modifica**, confrontati con
   il dopo e sottoposti all'utente prima di considerare chiuso il lavoro. Le quattro mosse sono
   isolate e reversibili singolarmente.
2. `npm run check` → **0 errori** (gate di qualità del progetto).
3. `npm run build` completa senza errori.
4. Liquid verificata su Chromium (lente vera attiva) e sul percorso di fallback.
5. Verifica con `prefers-reduced-motion` forzato: barre ferme ed estese, contenuti tutti
   raggiungibili.
6. Nessuna collisione visiva con Timeline, `LanguageSwitch` e audio FAB, su desktop e sotto 720px.
7. Le quattro schermate mostrano tutti i contenuti che oggi Glass mostra nei sette pannelli.

---

## 9. Fuori scope

Esclusi deliberatamente, benché presenti nell'articolo: mascotte cross-era, gallery infinita /
infinite canvas, carousel 3D cinematografico. Nessuna modifica a `Parallax` o `ThreeD`.

---

## 10. Rischi residui

- **La lente può risultare kitsch.** Mitigazione: scala del displacement, raggio e intensità della
  dispersione esposti come costanti in cima al componente, per tararli guardando il risultato
  invece che indovinando.
- **Sniffing del motore** (§5.3): compromesso accettato, reso sicuro dal default-a-fallback.
- **Prossimità concettuale con `Glass`**: mitigata dalle divergenze strutturali di §2, non solo
  cromatiche. Se in fase di revisione visiva le due ere sembrassero ancora vicine, la leva
  successiva è l'ambiente (rendere i wallpaper di Liquid ancora più saturi), non l'aggiunta di
  effetti.
