# Era Liquid Glass — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: usa `superpowers:subagent-driven-development`
> (consigliata) oppure `superpowers:executing-plans` per implementare questo piano task per task.
> Gli step usano checkbox (`- [ ]`) per il tracciamento.

**Goal:** Aggiungere l'era `liquid` (Liquid Glass, 2025) tra `glass` e `threed`, e rifocalizzare
l'era `Glass` esistente perché le due non si sovrappongano.

**Architecture:** Ogni era di questo progetto è un componente Svelte 5 autonomo in
`src/lib/themes/`, caricato lazy da un registry, con logica e CSS propri e contenuti letti da
`src/lib/cv-data.ts`. `Liquid.svelte` segue quel pattern, ma delega la matematica della lente a un
modulo puro affiancato (`src/lib/themes/liquid/lens.ts`) così che sia testabile con vitest. La
struttura è un **app shell**: testata statica con due barre + una sola regione scrollabile con
quattro schermate a tab.

**Tech Stack:** Svelte 5 (runes: `$state`, `$derived`, `$effect`), TypeScript, Vite, CSS puro
(nessuna libreria di stile), filtri SVG + `backdrop-filter`, Web Audio API (`src/lib/audio.ts`),
vitest per i due helper puri.

**Spec:** `docs/superpowers/specs/2026-08-30-liquid-glass-era-design.md` — leggerla **prima** di
iniziare. Il piano attua la spec; dove il piano e la spec divergono, vince la spec.

---

## Global Constraints

Valgono per **ogni** task, non si ripetono task per task:

- **Gate di qualità:** `npm run check` deve chiudere a **0 errori** prima di considerare concluso
  qualunque task. `npm run build` deve completare senza errori.
- **Fonte di verità unica:** ogni contenuto del CV viene da `src/lib/cv-data.ts`. **Non duplicare
  testi** dentro i componenti.
- **i18n:** ogni stringa di chrome nuova va aggiunta in `src/lib/translations.ts` **in entrambe le
  lingue** (`ui.it` e `ui.en`). I temi leggono lingua e dati **una volta all'init**
  (`const cvData = getCvData()`), non reattivamente: vengono rimontati dal `{#key}` in
  `+page.svelte`.
- **`prefers-reduced-motion`:** ogni animazione introdotta deve passare da questo filtro.
- **Niente commenti esplicativi nel codice.** Il repo ha commenti solo dove una logica di dominio
  non ovvia lo richiede davvero. Non narrare cosa fa una riga, non giustificare le modifiche, non
  citare questo piano nel codice.
- **Nessun asset binario nuovo.** I wallpaper sono gradienti CSS. Nessun webfont nuovo: Liquid usa
  lo stack di sistema.
- **Chiave tema:** `'liquid'`. Deep-link `#liquid`. Etichetta d'anno `'2025'`. Icona `💧`.
- **Commit frequenti**, uno per task, in italiano, nello stile del repo (`feat(liquid): …`).
  Non committare `.serena/` né `aura_bin` (untracked, non nostri).
- **Branch:** `feat/liquid-glass-era` (già creato, contiene la spec).

### Due punti da non scavalcare

1. **Il Task 11 contiene un gate di approvazione umana** (Step 6): il confronto prima/dopo delle
   schermate di `Glass` va **mostrato all'utente**, e bisogna **fermarsi ad attendere la sua
   conferma** prima di proseguire. L'utente ha chiesto esplicitamente di non peggiorare quell'era.
   Non è una formalità e non si auto-approva: se manca la risposta, il Task 11 resta aperto e si
   passa oltre solo dopo il suo sì.

2. **La lente si tara guardandola.** Le costanti in Task 8 Step 3 (`LENS_SCALE`, `LENS_RADIUS`,
   `LENS_STRENGTH`) sono valori di partenza plausibili, **non tarati**. Se l'effetto risulta
   eccessivo o kitsch, si abbassano quelle — **non** si aggiungono altri effetti per compensare.

---

## File Structure

| File | Responsabilità |
|---|---|
| `src/lib/themes/liquid/lens.ts` | **nuovo, puro.** Matematica della mappa di displacement + detection del motore. Nessun DOM, nessun import di Svelte → testabile. |
| `src/lib/themes/liquid/lens.test.ts` | **nuovo.** Test vitest del modulo sopra. |
| `src/lib/themes/Liquid.svelte` | **nuovo.** Il componente d'era: app shell, 4 schermate, due barre, wallpaper, vetro. |
| `src/lib/store.ts` | `Theme`, `THEMES`, `ERA_ORDER` |
| `src/lib/era-meta.ts` | riga della Timeline |
| `src/lib/themes/registry.ts` | loader lazy |
| `src/lib/audio.ts` | cue `case 'liquid'` |
| `src/lib/translations.ts` | `ui.it.liquid`, `ui.en.liquid` |
| `src/lib/components/Timeline.svelte` | skin `.theme-liquid` |
| `src/lib/components/LanguageSwitch.svelte` | skin `.theme-liquid` |
| `src/routes/+page.svelte` | lista temi + skin `.audio-fab` / `.timeline-scrim` |
| `src/lib/themes/Glass.svelte` | le 4 mosse di rifocalizzazione |
| `ERE.md`, `CLAUDE.md` | documentazione |

`src/lib/themes/winxp/` è il precedente già presente nel repo per una sottocartella d'era: seguire
quella convenzione.

---

## Task 1: Rete di sicurezza — baseline visivo di Glass

Va eseguito **per primo, prima di qualunque modifica al repo.** Serve a poter dimostrare, alla
fine, che `Glass` non è stato peggiorato.

**Files:**
- Create: `docs/superpowers/plans/assets/glass-before-light.png`
- Create: `docs/superpowers/plans/assets/glass-before-dark.png`

**Interfaces:**
- Produces: due immagini di riferimento usate dal Task 12 per il confronto prima/dopo.

- [ ] **Step 1: Avviare il dev server**
  ```bash
  npm run dev
  ```
  Girare in background e annotare la porta (default `5173`).

- [ ] **Step 2: Screenshot di `#glass` in chiaro**
  Aprire `http://localhost:5173/#glass` col browser. Se l'era parte in scuro, premere il toggle
  ☀/☾ in alto a destra per portarla in chiaro. Catturare la pagina intera salvando su disco in
  `docs/superpowers/plans/assets/glass-before-light.png`.

- [ ] **Step 3: Screenshot di `#glass` in scuro**
  Premere il toggle ☀/☾, catturare e salvare in
  `docs/superpowers/plans/assets/glass-before-dark.png`.

- [ ] **Step 4: Verificare che entrambi i file esistano e non siano vuoti**
  ```bash
  ls -l docs/superpowers/plans/assets/
  ```
  Atteso: due PNG, ciascuno > 50 KB.

- [ ] **Step 5: Commit**
  ```bash
  git add docs/superpowers/plans/assets/
  git commit -m "chore(glass): baseline visivo prima della rifocalizzazione"
  ```

---

## Task 2: Modulo puro `lens.ts` (TDD)

Qui il TDD è reale: sono funzioni pure con output verificabile. Tutto il resto dell'era è CSS e va
verificato a occhio.

**Files:**
- Create: `src/lib/themes/liquid/lens.ts`
- Test: `src/lib/themes/liquid/lens.test.ts`

**Interfaces:**
- Produces (usate dal Task 8):
  - `roundedRectSdf(x: number, y: number, halfW: number, halfH: number, radius: number): number`
  - `buildDisplacementMap(opts: LensMapOptions): Uint8ClampedArray` — RGBA, lunghezza `w*h*4`
  - `supportsBackdropLens(env: EngineEnv): boolean`
  - `interface LensMapOptions { width: number; height: number; radius: number; strength: number }`
  - `interface EngineEnv { vendor: string; supports(prop: string, value: string): boolean }`

- [ ] **Step 1: Scrivere i test che falliscono**

  Creare `src/lib/themes/liquid/lens.test.ts`:
  ```ts
  import { describe, expect, it } from 'vitest';
  import { buildDisplacementMap, roundedRectSdf, supportsBackdropLens } from './lens';

  describe('roundedRectSdf', () => {
    it('è negativa al centro', () => {
      expect(roundedRectSdf(0, 0, 50, 20, 10)).toBeLessThan(0);
    });

    it('è positiva fuori dal rettangolo', () => {
      expect(roundedRectSdf(80, 0, 50, 20, 10)).toBeGreaterThan(0);
    });

    it('è circa zero sul bordo', () => {
      expect(Math.abs(roundedRectSdf(50, 0, 50, 20, 10))).toBeLessThan(0.001);
    });
  });

  describe('buildDisplacementMap', () => {
    const w = 64;
    const h = 32;
    const map = buildDisplacementMap({ width: w, height: h, radius: 8, strength: 1 });

    const px = (x: number, y: number) => {
      const i = (y * w + x) * 4;
      return { r: map[i], g: map[i + 1], b: map[i + 2], a: map[i + 3] };
    };

    it('produce un buffer RGBA della dimensione attesa', () => {
      expect(map.length).toBe(w * h * 4);
    });

    it('è neutra al centro (nessuno spostamento)', () => {
      const c = px(w / 2, h / 2);
      expect(c.r).toBe(128);
      expect(c.g).toBe(128);
    });

    it('si discosta dal neutro vicino al bordo', () => {
      const edge = px(1, h / 2);
      expect(Math.abs(edge.r - 128)).toBeGreaterThan(4);
    });

    it('spinge in direzioni opposte sui due bordi orizzontali', () => {
      const left = px(1, h / 2).r - 128;
      const right = px(w - 2, h / 2).r - 128;
      expect(Math.sign(left)).toBe(-Math.sign(right));
    });

    it('è completamente opaca', () => {
      expect(px(0, 0).a).toBe(255);
      expect(px(w / 2, h / 2).a).toBe(255);
    });
  });

  describe('supportsBackdropLens', () => {
    const yes = () => true;
    const no = () => false;

    it('esclude WebKit (Safari e ogni browser su iOS)', () => {
      expect(supportsBackdropLens({ vendor: 'Apple Computer, Inc.', supports: no })).toBe(false);
    });

    it('esclude Gecko', () => {
      const supports = (prop: string) => prop === '-moz-appearance';
      expect(supportsBackdropLens({ vendor: '', supports })).toBe(false);
    });

    it('abilita la lente su Chromium', () => {
      expect(supportsBackdropLens({ vendor: 'Google Inc.', supports: no })).toBe(true);
    });

    it('in caso di dubbio degrada al fallback', () => {
      expect(supportsBackdropLens({ vendor: '', supports: yes })).toBe(false);
    });
  });
  ```

- [ ] **Step 2: Eseguire i test e verificare che falliscano**
  ```bash
  npx vitest run src/lib/themes/liquid/lens.test.ts
  ```
  Atteso: FAIL — il modulo `./lens` non esiste.

- [ ] **Step 3: Implementazione minima**

  Creare `src/lib/themes/liquid/lens.ts`:
  ```ts
  export interface LensMapOptions {
    width: number;
    height: number;
    radius: number;
    strength: number;
  }

  export interface EngineEnv {
    vendor: string;
    supports(prop: string, value: string): boolean;
  }

  export function roundedRectSdf(
    x: number,
    y: number,
    halfW: number,
    halfH: number,
    radius: number
  ): number {
    const r = Math.min(radius, Math.min(halfW, halfH));
    const qx = Math.abs(x) - (halfW - r);
    const qy = Math.abs(y) - (halfH - r);
    const outside = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
    const inside = Math.min(Math.max(qx, qy), 0);
    return outside + inside - r;
  }

  export function buildDisplacementMap(opts: LensMapOptions): Uint8ClampedArray {
    const { width, height, radius, strength } = opts;
    const data = new Uint8ClampedArray(width * height * 4);
    const halfW = width / 2;
    const halfH = height / 2;
    const falloff = Math.max(radius, 1);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cx = x - halfW + 0.5;
        const cy = y - halfH + 0.5;
        const d = roundedRectSdf(cx, cy, halfW, halfH, radius);
        const ramp = Math.max(0, Math.min(1, 1 + d / falloff));
        const eased = ramp * ramp;
        const len = Math.hypot(cx, cy) || 1;
        const amount = eased * strength * 127;

        const i = (y * width + x) * 4;
        data[i] = 128 + (cx / len) * amount;
        data[i + 1] = 128 + (cy / len) * amount;
        data[i + 2] = 128;
        data[i + 3] = 255;
      }
    }
    return data;
  }

  export function supportsBackdropLens(env: EngineEnv): boolean {
    if (env.vendor === 'Apple Computer, Inc.') return false;
    if (env.supports('-moz-appearance', 'none')) return false;
    return env.vendor === 'Google Inc.';
  }
  ```

- [ ] **Step 4: Eseguire i test e verificare che passino**
  ```bash
  npx vitest run src/lib/themes/liquid/lens.test.ts
  ```
  Atteso: PASS, 12 test.

  Se `spinge in direzioni opposte sui due bordi orizzontali` fallisce, la causa è il segno di
  `cx / len`: al bordo sinistro `cx` è negativo, al destro positivo — la mappa deve spingere il
  campionamento **verso l'esterno**, non tirarlo dentro. Non invertire il segno per far passare il
  test: verificare prima quale delle due direzioni produce la compressione ai bordi guardando il
  risultato nel Task 8, e allineare test e implementazione a quella.

- [ ] **Step 5: `npm run check`**
  ```bash
  npm run check
  ```
  Atteso: 0 errori.

- [ ] **Step 6: Commit**
  ```bash
  git add src/lib/themes/liquid/
  git commit -m "feat(liquid): modulo puro per mappa di displacement e detection del motore"
  ```

---

## Task 3: Registrare l'era nel sistema

Obiettivo: l'era esiste, è selezionabile dalla Timeline, il deep-link `#liquid` funziona e la build
passa — anche se il componente per ora mostra solo il nome. Da qui in poi ogni task successivo si
vede a schermo.

**Files:**
- Create: `src/lib/themes/Liquid.svelte`
- Modify: `src/lib/store.ts`, `src/lib/era-meta.ts`, `src/lib/themes/registry.ts`,
  `src/routes/+page.svelte`, `src/lib/translations.ts`

**Interfaces:**
- Consumes: niente.
- Produces: chiave tema `'liquid'`; `getUi().liquid` con le stringhe elencate sotto.

- [ ] **Step 1: Estendere il tipo `Theme` e l'ordine cronologico**

  In `src/lib/store.ts`, aggiungere `'liquid'` alla union `Theme`, all'array `THEMES` e a
  `ERA_ORDER` **tra `'glass'` e `'threed'`**:
  ```ts
  export const ERA_ORDER: Theme[] = ['terminal', 'teletext', 'pixel', 'web1', 'winxp', 'skeuo', 'material', 'bento', 'brutalism', 'parallax', 'glass', 'liquid', 'threed'];
  ```
  Estendere anche il commento di blocco sopra `ERA_ORDER` con una frase sulla nuova era, nello
  stile delle altre già documentate lì.

- [ ] **Step 2: Riga della Timeline**

  In `src/lib/era-meta.ts`, inserire **tra `glass` e `threed`**:
  ```ts
  { id: 'liquid', label: 'Liquid Glass', year: '2025', icon: '💧' },
  ```

- [ ] **Step 3: Loader lazy**

  In `src/lib/themes/registry.ts`, aggiungere a `themeLoaders`:
  ```ts
  liquid: () => import('./Liquid.svelte'),
  ```

- [ ] **Step 4: Lista temi in `+page.svelte`**

  In `src/routes/+page.svelte` c'è un array di temi hardcoded (intorno alla riga 143, dentro un
  `.includes(t as Theme)`). Aggiungere `'liquid'` **tra `'glass'` e `'threed'`** per rispecchiare
  `ERA_ORDER`.

- [ ] **Step 5: Stringhe i18n**

  In `src/lib/translations.ts`, aggiungere il blocco `liquid` sia in `ui.it` sia in `ui.en`,
  accanto al blocco `glass` esistente:
  ```ts
  liquid: {
    tabs: { profile: 'Profilo', path: 'Percorso', skills: 'Competenze', more: 'Altro' },
    tabsNav: 'Sezioni del profilo',
    wallpapers: { aurora: 'Aurora', sunset: 'Tramonto', deep: 'Abisso' },
    changeWallpaper: 'Cambia sfondo',
    currentWallpaper: (name: string) => `Sfondo attuale: ${name}. Tocca per cambiarlo`,
    profile: 'Profilo',
    experience: 'Esperienza',
    earlyCareer: 'Prima esperienza',
    skills: 'Competenze',
    languages: 'Lingue',
    education: 'Formazione',
    conferences: 'Conferenze'
  },
  ```
  Versione inglese:
  ```ts
  liquid: {
    tabs: { profile: 'Profile', path: 'Journey', skills: 'Skills', more: 'More' },
    tabsNav: 'Profile sections',
    wallpapers: { aurora: 'Aurora', sunset: 'Sunset', deep: 'Deep' },
    changeWallpaper: 'Change wallpaper',
    currentWallpaper: (name: string) => `Current wallpaper: ${name}. Tap to change it`,
    profile: 'Profile',
    experience: 'Experience',
    earlyCareer: 'Early career',
    skills: 'Skills',
    languages: 'Languages',
    education: 'Education',
    conferences: 'Talks'
  },
  ```

- [ ] **Step 6: Componente minimo**

  Creare `src/lib/themes/Liquid.svelte` con lo scheletro sufficiente a montarsi:
  ```svelte
  <script lang="ts">
    import { getCvData, getUi } from '$lib/i18n';

    const cvData = getCvData();
    const t = getUi().liquid;
  </script>

  <div class="liquid-wrapper">
    <h1>{cvData.name}</h1>
    <p>{t.tabs.profile}</p>
  </div>

  <style>
    .liquid-wrapper {
      width: 100vw;
      height: 100dvh;
      display: grid;
      place-items: center;
      background: #101018;
      color: #fff;
      font-family: -apple-system, 'SF Pro Display', system-ui, 'Segoe UI Variable', 'Segoe UI', sans-serif;
    }
  </style>
  ```

- [ ] **Step 7: Verificare che l'era sia raggiungibile**
  ```bash
  npm run check
  ```
  Atteso: 0 errori. Poi aprire `http://localhost:5173/#liquid`: deve comparire il nome su fondo
  scuro, e la Timeline deve mostrare 💧 Liquid Glass tra 🧊 Glass e 🌌 Future 3D. Verificare anche
  che il selettore lingua commuti IT/EN sull'etichetta della tab.

- [ ] **Step 8: Commit**
  ```bash
  git add src/lib/store.ts src/lib/era-meta.ts src/lib/themes/registry.ts src/routes/+page.svelte src/lib/translations.ts src/lib/themes/Liquid.svelte
  git commit -m "feat(liquid): registra l'era 2025 tra glass e threed"
  ```

---

## Task 4: App shell e quattro schermate

Contenuti completi, stile ancora essenziale: nessun vetro, nessun wallpaper, nessuna animazione.
Serve avere prima la struttura giusta e tutti i dati a schermo.

**Files:**
- Modify: `src/lib/themes/Liquid.svelte`

**Interfaces:**
- Consumes: `getCvData()`, `getUi().liquid` dal Task 3.
- Produces (usati da tutti i task successivi):
  - `type TabId = 'profile' | 'path' | 'skills' | 'more'`
  - `const TABS: { id: TabId; icon: string; label: string }[]`
  - stato `let active = $state<TabId>('profile')`
  - `const reduced: boolean` — scorciatoia per `prefers-reduced-motion`
  - struttura DOM: `.liquid-wrapper > .bars + .screen-scroll > section[role=tabpanel]`

- [ ] **Step 1: Dichiarazioni condivise**

  Vanno in cima allo `<script>`, perché i Task 6 e 8 vi si appoggiano:
  ```ts
  type TabId = 'profile' | 'path' | 'skills' | 'more';

  const TABS: { id: TabId; icon: string; label: string }[] = [
    { id: 'profile', icon: '◍', label: t.tabs.profile },
    { id: 'path', icon: '⌁', label: t.tabs.path },
    { id: 'skills', icon: '◈', label: t.tabs.skills },
    { id: 'more', icon: '⋯', label: t.tabs.more }
  ];

  let active = $state<TabId>('profile');

  const reduced =
    typeof window !== 'undefined' &&
    !!window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  ```
  Le icone sono glifi tipografici, non emoji: le emoji porterebbero un colore proprio che
  litiga con l'accento del wallpaper.

- [ ] **Step 2: Impianto app shell**

  Sostituire il markup del Task 3 con la struttura ad altezza fissa. Il punto non negoziabile:
  **le barre non sono `position: fixed`**, sono fratelli statici, e a scorrere è solo
  `.screen-scroll`.
  ```svelte
  <div class="liquid-wrapper">
    <header class="bars">
      <div class="identity"><span class="who">{cvData.name}</span><span class="what">{cvData.role}</span></div>
      <nav class="tabbar" role="tablist" aria-label={t.tabsNav}>
        <!-- 4 pulsanti, Task 6 -->
      </nav>
    </header>
    <div class="screen-scroll">
      <!-- 4 section[role=tabpanel], una sola visibile -->
    </div>
  </div>
  ```
  ```css
  .liquid-wrapper {
    display: flex;
    flex-direction: column;
    width: 100vw;
    height: 100dvh;
    overflow: hidden;
  }
  .screen-scroll {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 24px 20px 130px;
  }
  ```
  Il `padding-bottom: 130px` non è arbitrario: lascia spazio alla Timeline del sito
  (`fixed; bottom: 20px`), al `LanguageSwitch` e all'audio FAB. Glass usa `110px` per lo stesso
  motivo.

- [ ] **Step 3: Le quattro schermate**

  Quattro `<section role="tabpanel">`, con `hidden` su quelle non attive. Contenuti — **tutti da
  `cv-data.ts`**, nessun testo hardcoded:

  | Schermata | Campi |
  |---|---|
  | `profile` | `/avatar.svg` con fallback iniziali `ST` (vedi `Glass.svelte:96-102`), `name`, `role`, `tagline`, `contact.location`, capsule LinkedIn (`contact.linkedin`) ed email (`mailto:contact.email`) |
  | `path` | `experience[]` (`company`, `period`, `title`, `description`, `technologies[]`) + `earlyCareer` (`title`, `period`, `description`, `technologies[]`) |
  | `skills` | `skillGroups[]` (`label`, `items[]`) + `languages[]` (`name`, `level`, `note?`) |
  | `more` | `education[]` (`title`, `institute`, `period`) + `conferences[]` (`name`, `location`, `year`) |

  Riusare la forma del markup dei pannelli corrispondenti di `Glass.svelte` (righe 94-208) come
  riferimento per i campi, **non** per le classi CSS: qui i nomi delle classi sono nuovi.

- [ ] **Step 4: Verificare i contenuti**

  Aprire `#liquid` e controllare, cambiando `active` a mano nel codice se le tab non sono ancora
  cliccabili, che **tutti** i contenuti dei sette pannelli di Glass siano presenti nelle quattro
  schermate. Nessun campo perso: è un criterio di accettazione della spec.

- [ ] **Step 5: `npm run check`** — atteso 0 errori.

- [ ] **Step 6: Commit**
  ```bash
  git add src/lib/themes/Liquid.svelte
  git commit -m "feat(liquid): app shell e quattro schermate con i contenuti del CV"
  ```

---

## Task 5: Ambiente — tre wallpaper CSS e cambio-sfondo

**Files:**
- Modify: `src/lib/themes/Liquid.svelte`

**Interfaces:**
- Consumes: `t.wallpapers`, `t.changeWallpaper`, `t.currentWallpaper` dal Task 3.
- Produces:
  - `type WallpaperId = 'aurora' | 'sunset' | 'deep'`
  - stato `let wallpaper = $state<WallpaperId>(...)`
  - custom property `--l-accent` per wallpaper, consumata da tutti i task successivi.

- [ ] **Step 1: Token dei tre ambienti**

  Ogni wallpaper è una classe sul wrapper che definisce fondo e accento. Devono essere **saturi e
  contrastati**: la lente su fondo uniforme è invisibile (spec §3.1).
  ```css
  .liquid-wrapper {
    position: relative;
    background: var(--l-bg);
    color: #fff;
    font-family: -apple-system, 'SF Pro Display', system-ui, 'Segoe UI Variable', 'Segoe UI', sans-serif;
    letter-spacing: -0.01em;
    transition: background 0.6s ease;
  }
  .wp-aurora {
    --l-accent: #7aa2ff;
    --l-bg:
      radial-gradient(60% 55% at 12% 18%, #3b2fd6 0%, transparent 60%),
      radial-gradient(55% 50% at 85% 12%, #c02fb8 0%, transparent 62%),
      radial-gradient(70% 60% at 60% 95%, #1a6be0 0%, transparent 65%),
      linear-gradient(160deg, #14103a 0%, #241650 55%, #0d1030 100%);
  }
  .wp-sunset {
    --l-accent: #ffb37a;
    --l-bg:
      radial-gradient(58% 52% at 20% 88%, #ff6a3d 0%, transparent 62%),
      radial-gradient(52% 48% at 82% 20%, #ff3d8b 0%, transparent 60%),
      radial-gradient(65% 55% at 50% 45%, #6d3bd6 0%, transparent 68%),
      linear-gradient(155deg, #2a1038 0%, #4a1740 50%, #1b0d2c 100%);
  }
  .wp-deep {
    --l-accent: #5fe3d0;
    --l-bg:
      radial-gradient(60% 55% at 15% 25%, #0e7f8c 0%, transparent 62%),
      radial-gradient(55% 50% at 88% 78%, #1b3fb0 0%, transparent 60%),
      radial-gradient(70% 60% at 55% 10%, #12a58c 0%, transparent 65%),
      linear-gradient(165deg, #04141c 0%, #072634 55%, #03101a 100%);
  }
  ```

- [ ] **Step 2: Stato e persistenza**

  Stessa forma della persistenza già usata da `Glass.svelte:20-36`, con chiave propria:
  ```ts
  const WALLPAPERS = ['aurora', 'sunset', 'deep'] as const;
  type WallpaperId = (typeof WALLPAPERS)[number];

  const readWallpaper = (): WallpaperId => {
    if (typeof localStorage === 'undefined') return 'aurora';
    try {
      const saved = localStorage.getItem('cv_liquid_wallpaper');
      return WALLPAPERS.includes(saved as WallpaperId) ? (saved as WallpaperId) : 'aurora';
    } catch {
      return 'aurora';
    }
  };

  let wallpaper = $state<WallpaperId>(readWallpaper());

  const cycleWallpaper = () => {
    wallpaper = WALLPAPERS[(WALLPAPERS.indexOf(wallpaper) + 1) % WALLPAPERS.length];
    try {
      localStorage.setItem('cv_liquid_wallpaper', wallpaper);
    } catch {
      /* storage blocked */
    }
  };
  ```

- [ ] **Step 3: Pulsante di cambio-sfondo**

  Pulsante a capsula in alto a destra, `aria-label={t.changeWallpaper}` e
  `title={t.currentWallpaper(t.wallpapers[wallpaper])}`. Sotto i 720px va spostato **in alto a
  sinistra**, perché lì l'audio FAB del sito occupa l'angolo in alto a destra — stessa logica di
  `Glass.svelte:664-675`, da replicare.

- [ ] **Step 4: Verifica**

  Ciclare i tre sfondi: la transizione deve essere morbida, l'accento deve cambiare con lo sfondo,
  e la scelta deve sopravvivere a un reload e a un giro su un'altra era e ritorno.

- [ ] **Step 5: `npm run check`** — atteso 0 errori.

- [ ] **Step 6: Commit**
  ```bash
  git add src/lib/themes/Liquid.svelte
  git commit -m "feat(liquid): tre wallpaper CSS con cambio-sfondo persistente"
  ```

---

## Task 6: Navigazione — due barre, pillola a molla, collasso

Il cuore dell'era.

**Files:**
- Modify: `src/lib/themes/Liquid.svelte`

**Interfaces:**
- Consumes: `active`, `TabId` dal Task 4; `--l-accent` dal Task 5.
- Produces: stato `let collapsed = $state(false)`; classe `.bars.collapsed` consumata dal Task 7 e 8.

- [ ] **Step 1: Tab bar accessibile**

  Quattro pulsanti con il pattern ARIA completo:
  ```svelte
  <nav class="tabbar" role="tablist" aria-label={t.tabsNav}>
    {#each TABS as tab, i}
      <button
        role="tab"
        id="tab-{tab.id}"
        aria-selected={active === tab.id}
        aria-controls="panel-{tab.id}"
        tabindex={active === tab.id ? 0 : -1}
        onclick={() => (active = tab.id)}
        onkeydown={(e) => onTabKey(e, i)}
      >
        <span class="tab-icon" aria-hidden="true">{tab.icon}</span>
        <span class="tab-label">{tab.label}</span>
      </button>
    {/each}
    <span class="pill" aria-hidden="true"></span>
  </nav>
  ```
  Ogni `<section role="tabpanel">` del Task 4 riceve `id="panel-<id>"` e
  `aria-labelledby="tab-<id>"`.

  `onTabKey` implementa il pattern standard: `ArrowRight`/`ArrowLeft` spostano di uno con wrap,
  `Home`/`End` vanno agli estremi, e in tutti i casi il pulsante di destinazione riceve il focus.

- [ ] **Step 2: Pillola indicatore che si deforma**

  La pillola è posizionata in assoluto dentro `.tabbar` e mossa via custom property. Misurare la
  posizione del pulsante attivo con un `$effect` che dipende da `active`, e ricavare la
  deformazione dal segno dello spostamento:
  ```ts
  let tabbar = $state<HTMLElement | undefined>();

  $effect(() => {
    const bar = tabbar;
    const el = bar?.querySelector<HTMLElement>(`#tab-${active}`);
    if (!bar || !el) return;
    const x = el.offsetLeft;
    const w = el.offsetWidth;
    const prev = parseFloat(bar.style.getPropertyValue('--pill-x') || String(x));
    const dir = Math.sign(x - prev);
    bar.style.setProperty('--pill-x', String(x));
    bar.style.setProperty('--pill-w', String(w));
    if (dir !== 0 && !reduced) {
      bar.style.setProperty('--pill-stretch', '1.12');
      setTimeout(() => bar.style.setProperty('--pill-stretch', '1'), 180);
    }
  });
  ```
  ```css
  .pill {
    position: absolute;
    left: 0;
    transform: translateX(calc(var(--pill-x, 0) * 1px)) scaleX(var(--pill-stretch, 1));
    width: calc(var(--pill-w, 0) * 1px);
    transition: transform 0.42s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.42s cubic-bezier(0.34, 1.56, 0.64, 1);
    border-radius: 999px;
  }
  ```

- [ ] **Step 3: Collasso allo scroll**

  ```ts
  let collapsed = $state(false);
  let scroller = $state<HTMLElement | undefined>();

  $effect(() => {
    const el = scroller;
    if (!el || reduced) return;
    let idle: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      collapsed = el.scrollTop > 40;
      clearTimeout(idle);
      idle = setTimeout(() => (collapsed = false), 600);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      clearTimeout(idle);
      el.removeEventListener('scroll', onScroll);
    };
  });
  ```
  `bind:this={scroller}` va su `.screen-scroll`. In stato collassato le due barre diventano una
  capsula compatta con l'icona della tab attiva e la sua etichetta.

  La transizione anima **solo `transform` e `opacity`** — mai `backdrop-filter`, mai `height`
  (spec §3.3, §5.5). Concretamente: la striscia identità collassa con
  `transform: scaleY(0)` + `opacity: 0` e `transform-origin: top`, non riducendone l'altezza.

- [ ] **Step 4: `prefers-reduced-motion`**

  Con moto ridotto: nessun collasso (`collapsed` resta `false`), nessuna deformazione della pillola
  (`--pill-stretch` sempre `1`), nessuna transizione tra schermate. **Le tab restano pienamente
  funzionanti**: sono navigazione, non decorazione (spec §4.5).

- [ ] **Step 5: Verifica**

  - Mouse: le quattro tab cambiano schermata, la pillola scivola e rimbalza.
  - Tastiera: `Tab` entra nella tablist, frecce spostano, `Home`/`End` agli estremi, focus sempre
    visibile.
  - Scroll dentro una schermata lunga (`path`): le barre collassano e si riespandono alla quiete.
  - Con moto ridotto forzato (DevTools → Rendering → *Emulate CSS prefers-reduced-motion*): barre
    ferme ed estese, contenuti tutti raggiungibili.
  - Nessuna sovrapposizione con la Timeline in basso.

- [ ] **Step 6: `npm run check`** — atteso 0 errori.

- [ ] **Step 7: Commit**
  ```bash
  git add src/lib/themes/Liquid.svelte
  git commit -m "feat(liquid): doppia barra con pillola a molla e collasso allo scroll"
  ```

---

## Task 7: Il vetro — percorso di fallback

Si implementa **prima** il fallback e poi la lente: così il percorso che vedranno tutti gli utenti
WebKit e Gecko nasce curato, non come ripiego (spec §5.4).

**Files:**
- Modify: `src/lib/themes/Liquid.svelte`

**Interfaces:**
- Consumes: `--l-accent` dal Task 5; `.bars`, `.tabbar`, `.pill` dal Task 6.
- Produces: classe utility `.glass-surface` applicata a barre, card e capsule.

- [ ] **Step 1: Superficie di vetro base**
  ```css
  .glass-surface {
    position: relative;
    background: rgba(255, 255, 255, 0.12);
    -webkit-backdrop-filter: blur(18px) saturate(180%);
    backdrop-filter: blur(18px) saturate(180%);
    border-radius: 30px;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.45),
      inset 0 0 0 1px rgba(255, 255, 255, 0.12),
      0 18px 50px rgba(0, 0, 0, 0.35);
  }
  ```

- [ ] **Step 2: Rim-light e dispersione simulata**

  I tre ingredienti della spec §5.4 — rim-light conico, doppia ombra inset ciano/magenta, anello
  interno che finge la compressione ai bordi:
  ```css
  .glass-surface::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1px;
    background: conic-gradient(
      from 210deg,
      rgba(255, 255, 255, 0.7),
      rgba(120, 220, 255, 0.35) 25%,
      rgba(255, 255, 255, 0.15) 45%,
      rgba(255, 150, 230, 0.35) 70%,
      rgba(255, 255, 255, 0.7)
    );
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }
  .glass-surface::after {
    content: '';
    position: absolute;
    inset: 2px;
    border-radius: inherit;
    -webkit-backdrop-filter: blur(2px) brightness(1.08) saturate(1.4);
    backdrop-filter: blur(2px) brightness(1.08) saturate(1.4);
    transform: scale(1.015);
    box-shadow:
      inset 1px 0 6px rgba(90, 220, 255, 0.28),
      inset -1px 0 6px rgba(255, 120, 220, 0.28);
    pointer-events: none;
  }
  ```

- [ ] **Step 3: Applicare la superficie**

  `.glass-surface` va sulle due barre (e sulla capsula collassata), sulle card delle schermate e
  sulle capsule di contatto. Le card usano un `backdrop-filter` più leggero delle barre: il budget
  di rendering della spec §5.5 vuole l'effetto costoso concentrato sulla navigazione.

- [ ] **Step 4: Verifica leggibilità**

  Controllare il contrasto del testo sopra **tutti e tre** i wallpaper, incluse le zone più chiare
  dei gradienti (criterio della spec §4.6). Se un testo perde leggibilità, aumentare l'opacità del
  fondo del vetro — **non** scurire il wallpaper, che deve restare saturo perché la lente funzioni.

- [ ] **Step 5: `npm run check`** — atteso 0 errori.

- [ ] **Step 6: Commit**
  ```bash
  git add src/lib/themes/Liquid.svelte
  git commit -m "feat(liquid): vetro con rim-light e dispersione simulata (percorso fallback)"
  ```

---

## Task 8: La lente vera

**Files:**
- Modify: `src/lib/themes/Liquid.svelte`

**Interfaces:**
- Consumes: `buildDisplacementMap`, `supportsBackdropLens` dal Task 2; `.bars` dal Task 6;
  `.glass-surface` dal Task 7.
- Produces: classe `.lens-on` sul wrapper; filtro SVG `#liquid-lens`.

- [ ] **Step 1: Detection all'init**
  ```ts
  import { buildDisplacementMap, supportsBackdropLens } from './liquid/lens';

  let lensOn = $state(false);

  onMount(() => {
    lensOn = supportsBackdropLens({
      vendor: navigator.vendor ?? '',
      supports: (p, v) => CSS.supports(p, v)
    });
  });
  ```
  Il default è `false`: una detection sbagliata degrada al fallback del Task 7, non rompe nulla
  (spec §5.3).

- [ ] **Step 2: Filtro SVG**

  Inline nel componente, `aria-hidden`, fuori dal flusso. Tre passaggi di displacement con `scale`
  diverso per R, G e B, isolati con `feColorMatrix` e ricomposti con `feBlend` in modalità
  `screen` — è ciò che produce l'iridescenza (spec §5.2):
  ```svelte
  <svg class="lens-defs" aria-hidden="true" focusable="false">
    <filter id="liquid-lens" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
      <feImage href={mapUrl} result="map" preserveAspectRatio="none" />
      <feDisplacementMap in="SourceGraphic" in2="map" scale={LENS_SCALE * 1.06} xChannelSelector="R" yChannelSelector="G" result="dr" />
      <feDisplacementMap in="SourceGraphic" in2="map" scale={LENS_SCALE} xChannelSelector="R" yChannelSelector="G" result="dg" />
      <feDisplacementMap in="SourceGraphic" in2="map" scale={LENS_SCALE * 0.94} xChannelSelector="R" yChannelSelector="G" result="db" />
      <feColorMatrix in="dr" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
      <feColorMatrix in="dg" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
      <feColorMatrix in="db" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
      <feBlend in="r" in2="g" mode="screen" result="rg" />
      <feBlend in="rg" in2="b" mode="screen" />
    </filter>
  </svg>
  ```
  ```css
  .lens-defs { position: absolute; width: 0; height: 0; overflow: hidden; }
  .lens-on .bars.glass-surface {
    -webkit-backdrop-filter: url(#liquid-lens) blur(6px) saturate(180%);
    backdrop-filter: url(#liquid-lens) blur(6px) saturate(180%);
  }
  .lens-on .bars.glass-surface::after { display: none; }
  ```
  Con la lente attiva l'anello che *finge* la compressione (`::after` del Task 7) va spento: la
  compressione ora è vera e sommarle produce un doppio bordo.

- [ ] **Step 3: Costanti di taratura in cima al componente**

  La spec (§10) le richiede esplicitamente, perché la lente si tara guardandola:
  ```ts
  const LENS_SCALE = 46;
  const LENS_RADIUS = 30;
  const LENS_STRENGTH = 0.9;
  const LENS_MAP_W = 256;
  ```

- [ ] **Step 4: Generazione della mappa e rigenerazione su resize**

  Il punto critico della spec §5.1: **la barra cambia dimensione** (estesa ↔ collassata), e la
  mappa va rigenerata a ogni cambio di geometria, altrimenti la lente resta ancorata alla forma
  precedente.
  ```ts
  let mapUrl = $state('');
  let barsEl = $state<HTMLElement | undefined>();

  const regenerateMap = (w: number, h: number) => {
    if (!lensOn || w < 2 || h < 2) return;
    const mw = LENS_MAP_W;
    const mh = Math.max(2, Math.round((h / w) * mw));
    const canvas = document.createElement('canvas');
    canvas.width = mw;
    canvas.height = mh;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const data = buildDisplacementMap({
      width: mw,
      height: mh,
      radius: (LENS_RADIUS / w) * mw,
      strength: LENS_STRENGTH
    });
    ctx.putImageData(new ImageData(data, mw, mh), 0, 0);
    mapUrl = canvas.toDataURL();
  };

  $effect(() => {
    const el = barsEl;
    if (!el || !lensOn) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      regenerateMap(width, height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  });
  ```
  `bind:this={barsEl}` va sull'elemento `.bars`, lo stesso che porta `.glass-surface`.

- [ ] **Step 5: Verifica su Chromium**

  Aprire `#liquid` in Chrome e osservare il bordo della barra sopra una zona **contrastata** del
  wallpaper: il contenuto dietro deve risultare compresso ai bordi, con un accenno di iridescenza.
  Poi collassare la barra scrollando e verificare che la lente **segua la nuova forma** e non resti
  attaccata a quella estesa.

  Se l'effetto risulta eccessivo o kitsch, **tarare le costanti dello Step 3** — è esattamente il
  loro scopo. Non aggiungere altri effetti per compensare.

- [ ] **Step 6: Verifica del fallback**

  Forzare `lensOn = false` temporaneamente e controllare che il rendering torni a quello del Task 7,
  con l'anello `::after` di nuovo visibile e nessun bordo doppio. Ripristinare.

- [ ] **Step 7: `npm run check`** — atteso 0 errori.

- [ ] **Step 8: Commit**
  ```bash
  git add src/lib/themes/Liquid.svelte
  git commit -m "feat(liquid): lente a rifrazione con dispersione cromatica su Chromium"
  ```

---

## Task 9: Cue audio

**Files:**
- Modify: `src/lib/audio.ts`

**Interfaces:**
- Consumes: `tone(c, master, o: ToneOpts)` già usato dagli altri `case`, dove
  `ToneOpts = { freq; type?; start?; dur?; gain?; slideTo? }` e `slideTo` è il target di una glissata
  esponenziale. Serve esattamente questo: nessun oscillatore custom.
- Produces: `case 'liquid'` nello switch dei cue d'era.

- [ ] **Step 1: Aggiungere il case**

  Inserirlo **tra `case 'glass'` e `case 'parallax'`**. Una goccia: caduta rapida di pitch, scatto
  di ritorno verso l'alto, corpo basso a sostenere. Deve stare lontano sia dalla campanella
  cristallina di `glass` sia dal drone scuro di `threed` — acquatico, non cristallino (spec §7.1).
  ```ts
  case 'liquid': {
    // Water drop — a quick fall, a snap back up, a soft low body.
    tone(c, master, { freq: 900, type: 'sine', dur: 0.14, gain: 0.09, slideTo: 240 });
    tone(c, master, { freq: 260, type: 'sine', start: 0.12, dur: 0.26, gain: 0.11, slideTo: 720 });
    tone(c, master, { freq: 160, type: 'sine', start: 0.1, dur: 0.3, gain: 0.05 });
    break;
  }
  ```
  **Deroga consapevole al vincolo "niente commenti":** ogni `case` di questo file porta una riga
  che descrive il suono, perché il codice da solo non lascia intuire cosa si sentirà. Qui si segue
  la convenzione del file. È l'unico punto dell'intero piano in cui va aggiunto un commento.

- [ ] **Step 2: Verifica all'orecchio**

  Attivare l'audio dal FAB e passare da `glass` a `liquid` a `threed`: i tre cue devono essere
  distinguibili senza sforzo. Se `liquid` somiglia a `glass`, abbassare il registro e accorciare
  la coda.

- [ ] **Step 3: `npm run check`** — atteso 0 errori.

- [ ] **Step 4: Commit**
  ```bash
  git add src/lib/audio.ts
  git commit -m "feat(liquid): cue audio a goccia per l'era 2025"
  ```

---

## Task 10: Skin della chrome del sito

I componenti sempre montati (Timeline, selettore lingua, FAB audio) hanno una skin per era. Senza
questo task l'era si vede, ma la chrome sopra resta con i colori di un'altra epoca.

**Files:**
- Modify: `src/lib/components/Timeline.svelte`, `src/lib/components/LanguageSwitch.svelte`,
  `src/routes/+page.svelte`

**Interfaces:**
- Consumes: la classe `.theme-liquid` che `+page.svelte` applica già automaticamente in base
  all'era attiva.

- [ ] **Step 1: Skin Timeline**

  In `src/lib/components/Timeline.svelte`, accanto al blocco `.theme-glass` (righe ~788-828),
  aggiungere l'equivalente `:global(:root) .theme-liquid …` per `.timeline-container`,
  `.timeline-track`, `.node-pill`, `.timeline-stop:hover .node-pill`,
  `.timeline-stop.active .node-pill`, `.label-text`, `.timeline-fill`. Vetro scuro traslucido con
  bordo chiaro; la pillola attiva usa l'accento dell'era.

- [ ] **Step 2: Skin selettore lingua**

  In `src/lib/components/LanguageSwitch.svelte`, aggiungere `.lang-switch.theme-liquid` sul modello
  di `.theme-glass` (riga ~238).

- [ ] **Step 3: Skin FAB audio e scrim**

  In `src/routes/+page.svelte`, aggiungere `.audio-fab.theme-liquid` e `.audio-fab.theme-liquid.on`
  sul modello di `.audio-fab.theme-glass` (righe ~476-490), più `.timeline-scrim.theme-liquid` se
  la Timeline risulta poco leggibile sopra i wallpaper più chiari.

- [ ] **Step 4: Verifica su tutti e tre i wallpaper**

  La Timeline, il selettore lingua e il FAB devono restare leggibili sopra Aurora, Tramonto e
  Abisso. Controllare anche sotto i 720px, dove la Timeline diventa uno stepper compatto e il FAB
  audio si sposta in alto a destra.

- [ ] **Step 5: `npm run check`** — atteso 0 errori.

- [ ] **Step 6: Commit**
  ```bash
  git add src/lib/components/Timeline.svelte src/lib/components/LanguageSwitch.svelte src/routes/+page.svelte
  git commit -m "feat(liquid): skin della chrome del sito per l'era 2025"
  ```

---

## Task 11: Le quattro mosse su `Glass`

Modifiche chirurgiche e reversibili una per una. Il principio (spec §6): ogni effetto che diventa
firma di Liquid esce da Glass.

**Files:**
- Modify: `src/lib/themes/Glass.svelte`

- [ ] **Step 1: Rimuovere tilt e sheen**

  In `src/lib/themes/Glass.svelte`:
  - riga 4: l'import diventa `import { reveal } from '$lib/actions/interactive';`
  - rimuovere `use:tilt={{ … }}` da tutti e sette i pannelli (righe 95, 120, 126, 156, 171, 187,
    198), lasciando intatto `use:reveal`;
  - rimuovere l'intera regola `.panel::after` (righe 432-446), che è lo sheen speculare.

- [ ] **Step 2: Rimuovere i residui del 3D**

  - riga 423: eliminare `transform-style: preserve-3d;`
  - riga 427: eliminare `will-change: transform;` da `.panel:hover`, **mantenendo** il
    `box-shadow: var(--g-panel-shadow-hover);` che dà ancora il sollevamento all'hover;
  - riga 422: dalla `transition` di `.panel` togliere `transform`, che ora non cambia mai.

- [ ] **Step 3: Stringere i raggi**

  - riga 418: `.panel` `border-radius: 26px` → `18px`
  - riga 572: `.exp-item` `border-radius: 16px` → `12px`

- [ ] **Step 4: Pannelli più lattiginosi**

  - riga 232: `--g-panel-bg: rgba(255, 255, 255, 0.45)` → `rgba(255, 255, 255, 0.58)`
  - riga 289 (blocco `.dark`): `--g-panel-bg: rgba(28, 28, 44, 0.45)` → `rgba(28, 28, 44, 0.55)`

- [ ] **Step 5: Confronto prima/dopo**

  Riaprire `#glass` in chiaro e in scuro, catturare
  `docs/superpowers/plans/assets/glass-after-light.png` e `…-after-dark.png`, e confrontarli con i
  baseline del Task 1.

  Controllare in particolare che: i pannelli non siano diventati opachi al punto da spegnere
  l'aurora dietro; l'hover sollevi ancora; nessun pannello sia rimasto con una `transform` inline
  appiccicata da un hover precedente (era il motivo del commento a `interactive.ts:52-54`).

- [ ] **Step 6: Sottoporre il confronto all'utente**

  **Gate esplicito, richiesto dall'utente.** Mostrare le quattro immagini (prima/dopo × chiaro/scuro)
  e attendere conferma. Se preferisce il prima, ciascuna delle quattro mosse è isolata e si può
  revertire singolarmente.

- [ ] **Step 7: `npm run check`** — atteso 0 errori.

- [ ] **Step 8: Commit**
  ```bash
  git add src/lib/themes/Glass.svelte docs/superpowers/plans/assets/
  git commit -m "refactor(glass): rifocalizza l'era 2020 e cede a liquid il vocabolario della lente"
  ```

---

## Task 12: Documentazione

**Files:**
- Modify: `ERE.md`, `CLAUDE.md`

- [ ] **Step 1: Scheda in `ERE.md`**

  Aggiungere `## 16. Liquid Glass — ✅ Implementato` seguendo **esattamente** la struttura delle
  schede esistenti (vedi §9 Glassmorphism, righe 444+): stato implementazione, ambiente, struttura,
  tipografia, cue audio, `prefers-reduced-motion`, differenziazione dalle ere adiacenti.

- [ ] **Step 2: Aggiornare il quadro d'insieme di `ERE.md`**

  Aggiungere la riga nella tabella (§ "Quadro d'insieme", righe 37-54) e aggiornare la sezione
  "Priorità suggerite per le proposte" (righe ~897+) segnando la nuova era come implementata.

- [ ] **Step 3: Aggiornare `ERE.md` §9**

  La scheda di Glassmorphism cita `tilt`, lo sheen speculare e i raggi da 26px, che il Task 11 ha
  rimosso. Allinearla, e annotare la differenziazione rispetto a Liquid.

- [ ] **Step 4: Paragrafo in `CLAUDE.md`**

  Aggiungere il blocco `> **Era Liquid Glass — ✅ implementata**` nello stile degli altri, e
  aggiornare gli elenchi che enumerano le ere: la riga "Isolamento per-tema" e la riga "Stato tema"
  con il deep-link `#liquid`.

- [ ] **Step 5: Commit**
  ```bash
  git add ERE.md CLAUDE.md
  git commit -m "docs: scheda dell'era Liquid Glass e allineamento della scheda Glass"
  ```

---

## Task 13: Verifica finale

Ripercorre uno a uno i criteri di accettazione della spec §8.

- [ ] **Step 1: Gate di qualità**
  ```bash
  npm run check && npm run build && npx vitest run
  ```
  Atteso: 0 errori di svelte-check, build completata, test di `lens.ts` verdi.

- [ ] **Step 2: Percorso lente (Chromium)**

  `#liquid` su Chrome: lente attiva, iridescenza sul bordo, mappa che segue il collasso della barra.

- [ ] **Step 3: Percorso fallback**

  Forzare `lensOn = false` e verificare che il rendering resti convincente e senza bordi doppi.

- [ ] **Step 4: Moto ridotto**

  Con `prefers-reduced-motion` emulato: barre ferme ed estese, nessuna deformazione, contenuti
  tutti raggiungibili, tab ancora funzionanti.

- [ ] **Step 5: Mobile e collisioni**

  A 375px e a 720px: nessuna sovrapposizione tra le barre di Liquid, la Timeline, il selettore
  lingua, il FAB audio e il pulsante wallpaper.

- [ ] **Step 6: Copertura dei contenuti**

  Le quattro schermate mostrano **tutti** i contenuti che `Glass` mostra nei sette pannelli.
  Confronto campo per campo con `cv-data.ts`.

- [ ] **Step 7: i18n**

  Commutare IT/EN su ogni schermata: nessuna stringa non tradotta, nessun testo hardcoded.

- [ ] **Step 8: Deep-link e persistenza**

  `#liquid` da URL pulito; il wallpaper scelto sopravvive al reload e al cambio d'era; il
  navigatore avanti/indietro attraversa le ere correttamente.

- [ ] **Step 9: Commit finale se restano ritocchi**
  ```bash
  git add -A ':!.serena' ':!aura_bin'
  git commit -m "fix(liquid): rifiniture dalla verifica finale"
  ```
