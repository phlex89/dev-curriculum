# Analisi stili — skill `ui-ux-pro-max` vs ere implementate

> Data: 24 settembre 2026. Revisione in sola lettura: nessun file del sito è stato modificato.
> Fonti: `.claude/skills/ui-ux-pro-max/data/styles.csv` (88 schede), `ERE.md`, `MIGLIORAMENTI.md`,
> codice dei 13 temi in `src/lib/themes/`, label della Timeline in `src/lib/translations.ts`.
> I valori di contrasto citati sono stati **ricalcolati** con la formula WCAG, non stimati.

## 1. Verdetto in breve

- La skill **non porta ere nuove di peso** che `ERE.md` non avesse già valutato. Delle 88 schede,
  circa 40 sono dashboard BI, pattern di landing page o design system di piattaforma (Fluent,
  Polaris, Spectrum): fuori tema per una time-machine. Le ~20 pertinenti coincidono quasi tutte con
  ere già fatte o già valutate (Y2K, Neumorphism, AI-Native, Vaporwave).
- Il suo valore reale sta nelle **checklist di implementazione** e nei criteri di accessibilità per
  stile: usate come metro, fanno emergere difetti concreti nelle ere esistenti.
- I problemi più seri trovati **non sono estetici ma di coerenza**:
  1. tre **violazioni di contrasto AA** non coperte da deroga (Brutalismo ×2, Bento dark);
  2. una **cronologia della Timeline incoerente** (Bento "2015", Brutalismo "2017" che in realtà è
     neubrutalism 2021+, "Future 3D · 2026" che oggi è il presente);
  3. l'era **3D** è la più debole ed è ormai scavalcata da Liquid (2025): come "finale" non regge più.
- Le ere più deboli, in ordine di urgenza: **ThreeD (6)**, **WinXP (6.5)**, **Brutalismo (6.5)**.
  Le più rifinite: **Pixel Art (9)**, **Liquid (9)**, **Teletext (8.5)**.

## 2. Mappa: schede della skill ↔ ere

| Era (chiave) | Schede skill corrispondenti (`No`) | Esito del confronto |
|---|---|---|
| `terminal` | 73 Terminal CLI, 80 Cyberpunk HUD, 67 Chromatic Aberration | Mancano bloom a due livelli, flicker, aberrazione (già in backlog) |
| `teletext` | 67, 68 Vintage Analog | Già matura; margine solo su chroma-bleed del segnale composito |
| `pixel` | 52 Pixel Art | Allineata; è il riferimento di qualità del progetto |
| `web1` | 68 Vintage Analog | Buona; margine su grana "GIF compressa" dei badge |
| `winxp` | 13 Skeuomorphism | Mancano i lucidi Luna, font dei titoli, semantica dialog |
| `skeuo` | 13 Skeuomorphism | Manca la texture noise/grain, tratto distintivo della scheda |
| `material` | 12 Flat, 76 Material 3 (solo per contrasto) | Solida; ritocchi minori |
| `bento` | 39 / 53 Bento Grid | Layout corretto; bug di contrasto in dark |
| `brutalism` | 4 Brutalism, 38 Neubrutalism, 77 Neo Brutalism | **È neubrutalism**, non brutalismo 2017 |
| `parallax` | 49 Parallax Storytelling, 15, 48, 62 | Allineata; ritocchi su cursore e magnetismo |
| `glass` | 3 Glassmorphism, 10 Aurora, 65 Gradient Mesh | Blur 30px sopra il range consigliato (10–20px) |
| `liquid` | 14 Liquid Glass, 55 Spatial UI | Allineata; da profilare su iPhone reale |
| `threed` | 5 3D & Hyperrealism, 51 HUD/FUI, 41 Cyberpunk | Identità debole: card di vetro sfocato come Glass/Liquid |

Schede **scartate** come fuori tema: 20–37 (landing e dashboard), 86–89 (design system di
piattaforma), 69–85 (varianti mobile di stili già coperti), 8/17 (accessibilità: sono principi,
non estetiche).

## 3. Stato per era

Voti di rifinitura 1–10. Costo: S = ore, M = mezza giornata/giornata, L = più giorni.

### Ere retro

**Terminal — 7.5.** Impianto solido (boot POST, typewriter, history, Tab completion), ma il layer
CRT è di base: un solo `text-shadow` di glow (`Terminal.svelte:519`).
- (S) Bloom a due livelli sui glifi.
- (S) `aria-live="polite"` sull'output (`Terminal.svelte:442`): oggi lo screen reader non annuncia nulla.
- (S) Flicker CRT impercettibile (0.5–1% di opacità), gated da reduced-motion.
- (S) Aberrazione cromatica ±0.5px, dosata per non perdere contrasto.
- Difetto: `.real-input` ha `outline: none` (`:636`) senza `:focus-visible` sostitutivo.

**Teletext — 8.5.** La più caratterizzata del blocco retro. Margini solo cosmetici:
- (M) Chroma-bleed da segnale composito sui bordi dei blocchi (sfocatura 1px, non glitch digitale).
- (S) Micro-rumore "neve" sullo sfondo della stanza in idle.

**Pixel Art — 9.** Riferimento di qualità. Unica nota: D-pad e tasti A/B sono `aria-hidden`
(`PixelArt.svelte:691,699`); dare almeno `aria-label` ai tasti (S).

**Web 1.0 — 8.** Credibile, niente webfont, guestbook vero.
- (S) Grana leggera sui badge 88×31 per venderli come GIF d'epoca.
- (S) Bevel più marcato sulle card, stile tabella HTML 3.2.

**Windows XP — 6.5. Priorità del blocco retro.** Verificato nel codice: la titlebar è un
`linear-gradient(to right, …)` a due stop (`WinXP.svelte:656`) e lo Start è un gradiente piatto a
due stop (`:789`). Mancano i dettagli che fanno riconoscere Luna al primo sguardo.
- (S) Banda lucida nel primo 40% di titlebar e pulsante Start (il singolo intervento più efficace).
- (S) Titoli finestra in Trebuchet MS bold (font di sistema, nessun webfont).
- (S/M) `role="dialog"` + `aria-labelledby` + chiusura con `Esc` sulle finestre: oggi 6 attributi
  ARIA in tutto il file contro i 16–22 delle altre ere.
- (M) Cursore XP custom (serve un asset originale).

### Ere 2010–2017

**Skeuomorfismo — 7.**
- (M) Texture noise/grain sul fondo e sui materiali: la scheda 13 la indica come tratto distintivo.
- (S) Variabili dichiarate e mai usate (`--stitch`, `--leather-2`, `--metal-hi/-lo`,
  `--gel-blue`, `--gel-purple`, `Skeuo.svelte:169–178`): la cucitura della pelle era pensata e
  mai collegata. Collegarla o eliminarla.
- (S) Pressione dei gel button troppo secca (0.08s): portarla a ~150ms con un lieve rimbalzo.
- (S) Contact bar a 3 colonne con 2 soli bottoni (`:605`): cella vuota.

**Material — 8.** Ripple, ink-bar, scroll-spy e FAB autentici; nessun `backdrop-filter`.
- (S) Tab inattive a 4.59:1: a norma ma senza margine, alzare l'opacità a 0.82.
- (S/M) LinearProgress delle lingue che "cresce" all'apparizione, come nel Material 2014–2017.
- (S) Raggio 8px uniforme: distinguere meglio "squadrato + ombra netta" dal 24px del Bento.

**Bento — 7.**
- (S) **Bug AA**: `.role-badge` bianco su `#7c74ff` in dark = **3.62:1** (`BentoBox.svelte:235,384`).
- (S) Link social senza avviso "si apre in nuova scheda" (già in backlog).
- `ERE.md` §8 parla di "vetro smerigliato" ma il codice non usa blur: meglio correggere la scheda,
  perché proprio l'assenza di blur lo separa da Glass.

**Brutalismo — 6.5. Priorità del blocco.**
- (S) **Bug AA**: CTA telefono, `#f3efe2` su `#ff4fa6` = **2.64:1** (`Brutalism.svelte:639`).
- (S) **Bug AA**: etichetta skill rossa, `#f3efe2` su `#ff3b1d` = **3.10:1** (`:626`).
  Con testo `--ink` `#0c0c0c` il rosa sale a 6.45:1: la correzione è una riga.
- Identità: bordi 3–4px, ombre offset dure, "pressione meccanica", tre Google Font display. È la
  formula del **neubrutalism** (schede 38/77, 2021+), non del brutalismo web 2017 (schede 4:
  font di default, grezzo, monocromo). La label "Brutalism · 2017" è sbagliata di circa quattro anni.

### Ere moderne

**Parallax — 8.** Lenis lazy, doppio binario reduced-motion esemplare, cursore gated su
`pointer: fine`.
- (S) Feedback di click sul cursore custom (scale-down), richiesto dalla scheda 62.
- (S) Estendere `use:magnetic` a puntini indice e scroll hint, non solo ai due CTA finali.

**Glass — 7.**
- (S) `backdrop-filter: blur(30px)` su sette pannelli sopra cinque blob sfocati (`Glass.svelte:413`):
  sopra il range della scheda 3. Scendere a ~20px non cambia l'effetto e alleggerisce la GPU.
- (M) Nessuna riduzione di blob sotto i breakpoint stretti: rischio jank su telefoni deboli.
- (S) `.mode-toggle` a 20px contro i 30px del resto: armonizzare.

**Liquid — 9.** Nessun `position: fixed`, detection in un punto solo, cache + debounce reali,
ARIA tablist completo. Resta da fare solo un profiling su iPhone fisico del fallback WebKit (S).

**ThreeD — 6. Priorità assoluta.**
- Identità: le card sono `.glass-card` con `backdrop-filter: blur(16px)` (`ThreeD.svelte:453`) e
  `use:tilt`, la stessa azione di Bento e Skeuo. Visivamente è "vetro scuro sopra particelle":
  troppo vicina a Glass e Liquid, e con meno firma di entrambe.
- Narrativa: la label è **"Future 3D · 2026"**, ma siamo nel 2026. Il "futuro" oggi è il presente,
  e Liquid (2025) è già più avanti per rifinitura.
- Backlog ancora aperto nel codice: nessun bordo `conic-gradient` reattivo, nessuna velocità
  differenziata per i layer di particelle (solo la camera segue il mouse), nessun fallback
  statico senza WebGL.

## 4. Problemi trasversali

### 4.1 Cronologia della Timeline

Label attuali (`translations.ts:236–248`) confrontate con la storia reale:

| Era | Label attuale | Periodo reale | Problema |
|---|---|---|---|
| `bento` | Modern Flat · 2015 | Bento grid: 2021–2023 (Apple, Linear) | Anticipato di ~6 anni |
| `brutalism` | Brutalism · 2017 | Il codice è neubrutalism: 2021+ (Gumroad, Figma) | Etichetta e stile non coincidono |
| `threed` | Future 3D · 2026 | Oggi | Il futuro è diventato presente |

Proposta di cronologia pulita (le chiavi restano uguali, cambiano label e posizione):

```
terminal 1980s · teletext 1984 · pixel 1988 · web1 1996 · [y2k 2000] · winxp 2001 ·
skeuo 2010 · material 2014 · parallax 2018 · threed "WebGL" 2019 · glass 2020 ·
brutalism "Neubrutalism" 2021 · bento 2022 · liquid 2025 · [ai 2030+]
```

### 4.2 Ripensare il 3D invece di rifinirlo

Rifinire il 3D com'è (bordi conici, parallax delle stelle) lo lascia comunque nel posto sbagliato.
La proposta è **ricollocarlo nella storia reale**: l'era dei portfolio **WebGL immersivi**
(2016–2023: Awwwards, il portfolio-gioco di Bruno Simon, i siti Three.js "da premio"). Così:
- smette di essere un "futuro" già scaduto e diventa un'epoca riconoscibile;
- si libera il posto di finale per l'**era AI** (§11 di `ERE.md`), che è davvero oltre il presente;
- va tolto il vetro sfocato dalle card: nel WebGL d'epoca i contenuti stavano **nella scena**
  (testo 3D, piani nello spazio, camera che si muove tra le sezioni), non in card sopra lo sfondo.

È l'intervento più grande (L), ma è quello che alza di più la qualità percepita del finale attuale.

### 4.3 Contrasto

Tre violazioni reali, tutte correggibili in pochi minuti: vanno sistemate prima di qualsiasi
lavoro estetico, perché `ERE.md` dichiara AA obbligatorio fuori dalle deroghe elencate.

## 5. Nuove ere

| Candidato | Scheda skill | Verdetto | Motivo |
|---|---|---|---|
| **Y2K / Chrome** | 40 | ✅ **Consigliata, prima** | Già valutata headliner in `ERE.md` §12. Colma il buco 1996→2001, revival forte, tutto in CSS. La skill conferma la formula (cromo, bottoni glossy, bolle, sparkle). |
| **AI / Conversazionale** | 43, 18 | ✅ **Consigliata, come nuovo finale** | `ERE.md` §11. Con il 3D ricollocato diventa l'unico vero "futuro". Agente deterministico da `cv-data.ts`. |
| **Soft UI (Neumorphism + Claymorphism)** | 2, 9 | 🟡 Opzionale | Unire i due trend 2020–2022 in un'era sola ha più carattere del solo neumorphism. Rischio: contrasto basso per natura, serve il toggle "contrasto" già previsto in §14. |
| Spatial UI (visionOS) | 55 | ❌ | Vetro e profondità: sovrappone Liquid e il 3D. |
| Editorial / Swiss | 50, 66 | ❌ | È stampa, non un'epoca della UI; Parallax ne copre già il lato editoriale. |
| Anti-Polish / Hand-drawn | 59, 84 | ❌ come era, ✅ come easter egg | Controtendenza 2025 "fatto a mano" contro l'AI: bella idea di contrappunto *dentro* l'era AI, non un'era. |
| Memphis, Vaporwave, Gen Z Chaos, Cyberpunk | 44, 45, 57, 41 | ❌ | Estetiche o meme, non epoche UI; il neon si scontra col 3D. Già scartate in `ERE.md`. |

Totale dopo il piano: 15 ere (13 attuali + Y2K + AI), 16 con Soft UI.

## 6. Piano proposto a ondate

1. **Ondata 0 — correttezza (S, poche ore).** Tre fix di contrasto, `aria-live` nel Terminale,
   `aria-label` sui tasti touch della Pixel Art, label della Timeline corrette (IT e EN).
2. **Ondata 1 — ere deboli (M).** WinXP (lucidi Luna, font titoli, dialog + `Esc`),
   Skeuo (grain + cucitura), Glass (blur e blob su mobile).
3. **Ondata 2 — 3D ricollocato (L).** Da "Future 3D" a "WebGL · 2019", contenuti nella scena,
   niente vetro, fallback statico senza WebGL. Spostamento in `ERA_ORDER`.
4. **Ondata 3 — nuove ere (L ciascuna).** Y2K, poi AI come finale.
5. **Ondata 4 — rifinitura fine (S ciascuno).** CRT del Terminale, chroma-bleed del Televideo,
   progress Material, cursore Parallax, Soft UI se confermata.

## 7. Uso di 21st.dev (piano gratuito, 2 ricerche)

Per le ondate 0–2 **non serve**: sono correzioni e ritocchi su componenti già scritti con un'estetica
d'epoca precisa, e i componenti di 21st.dev sono React/Tailwind moderni. Propongo di spendere
**una sola ricerca**, al momento di costruire l'era **AI**, per l'interfaccia di chat (typing
indicator, streaming del testo, context card): è l'unico punto in cui un catalogo di componenti
contemporanei aiuta davvero. La seconda resta di riserva.

## 8. Decisioni da prendere

1. **3D**: ricollocarlo come "WebGL · 2019" (consigliato) oppure tenerlo come "futuro" e solo rifinirlo?
2. **Brutalismo**: rinominarlo "Neubrutalism · 2021" tenendo lo stile (consigliato, è quello più
   curato) oppure riportarlo al brutalismo grezzo del 2017?
3. **Nuove ere**: Y2K + AI (consigliato), con o senza Soft UI?
4. **Da dove partire**: ondata 0 subito (consigliato), poi le altre nell'ordine proposto?

## 9. Stato di avanzamento (24 set 2026, branch `fix/revisione-stili`)

- ✅ **Ondata 0.** Contrasti corretti e ricalcolati (Brutalismo rosa/rosso con testo `--ink`, badge Bento
  dark 5.45:1, didascalie ed etichette di Glass ≥4.5:1 nel caso peggiore), `aria-live` nel Terminale,
  D-pad Pixel Art fuori dal tab order, label e ordine della Timeline (`Neubrutalism · 2021`,
  `Bento · 2022`), documentazione allineata.
- ✅ **Ondata 1.** WinXP: titlebar, pulsanti e Start in stile Luna, Trebuchet MS sui titoli, finestre
  `role="dialog"` con focus che entra e torna all'icona. Skeuo: grana su pelle/feltro/metallo/carta,
  cucitura sulla pelle, variabili morte collegate o rimosse, pressione dei gel a 150ms, contact bar a
  due colonne. Glass: blur 30→20px con velo compensato, blob alleggeriti sotto i 720px.
- ✅ **Ondata 4 (parziale).** Bloom, flicker e aberrazione del Terminale; chroma-bleed e neve del
  Televideo; grana dei badge e bevel HTML 3.2 in Web 1.0; Material con card a 2px, tab a 0.82 e
  LinearProgress che cresce; Parallax con feedback di click del cursore e magnetismo su puntini e hint.
- ✅ **Trovato in verifica a schermo.** La `timeline-scrim` di `+page.svelte` scuriva del ~35% la
  taskbar di XP: disattivata per quell'era.
- ⏭️ **Saltato.** Cursore XP (con un SVG non sarebbe stato credibile).
- ✅ **Ondata 2.** Il 3D è ora **"WebGL · 2019"** (`ThreeD.svelte` riscritto + `threed/shaders.ts`),
  tra `parallax` e `glass`: preloader `000→100`, blob `ShaderMaterial` iridescente senza post-processing,
  cinque capitoli guidati dallo scroll, carriera come curva 3D con etichette DOM proiettate, fallback
  per reduced-motion, senza WebGL e mobile. Orbitron dismesso. La timeline oggi chiude con `liquid`.
- ✅ **Refactor 1–3** della §10 (`isTheme`, `switch` audio esaustivo, `src/lib/motion.ts`).
- ⬜ **Aperto.** Ondata 3 (Y2K, poi AI come finale).

## 10. Refactor proposti

| # | Refactor | Beneficio | Costo |
|---|---|---|---|
| 1 | `isTheme` esportato da `store.ts` e usato in `+page.svelte:143`, che oggi ripete a mano l'elenco delle ere | Una nuova era aggiunta solo a `store.ts` rompe in silenzio back/forward del browser | S |
| 2 | `switch` di `audio.ts` reso esaustivo (`satisfies never` o `Record<Theme, …>`) | Dimenticare il cue di una nuova era diventa errore di `npm run check` | S |
| 3 | `prefersReducedMotion()` in `src/lib/motion.ts`: oggi 12 copie in 12 file | Un solo punto di verità, nessuna deriva | S |
| 4 | Focus management al cambio era (voce ⬜ di `MIGLIORAMENTI.md`) | Chi naviga da tastiera o con screen reader resta orientato | S/M |
| 5 | Nuove ere (Y2K, AI) che espongono custom property alla Timeline invece di un nuovo blocco di CSS globale (oggi 744 righe e 97 blocchi `.theme-X`) | La Timeline smette di crescere a ogni era | M |
| 6 | Window manager di XP estratto in `winxp/window-manager.ts` con test, come `liquid/lens.ts` | Rete di sicurezza sulla logica non visiva più complessa | M |
| 7 | Motore griglia e collisioni della Pixel Art estratto e testato | Come sopra | M |

Scartati: un registro unico che sostituisca store/era-meta/translations/audio (contenuti di natura
diversa, meglio i fix 1–2), il retrofit delle 13 skin della Timeline (rischio di regressione visiva) e
l'unificazione di `localStorage` (3 file, ~20 righe).
