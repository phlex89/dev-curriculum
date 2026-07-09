<script lang="ts">
  // ──────────────────────────────────────────────────────────────────────────
  // Pixel Art / 8-bit Console Gaming era (≈1988).
  //
  // A top-down RPG overworld (Zelda/Pokémon flavour, NOT a platformer): walk a
  // tiled map with WASD/arrows; the camera follows the hero; getting adjacent to
  // a "zone" (building) opens an NES-style dialog box with the relevant slice of
  // cv-data. The six zones sit along a single winding road that runs left→right
  // in narrative order (Casa → Castello → Bottega → Biblioteca → Posta → Scrigno),
  // so the map reads as a journey. Every content path is reachable WITHOUT playing
  // — buildings are real buttons (click to open) and a persistent "MOSTRA TUTTO"
  // directory lists every zone. Under prefers-reduced-motion the map/camera are
  // dropped entirely and the zones render as a static button directory. Pixel grid
  // is tile/32 (finer than a classic tile/8) for crisper sprites. Only original
  // CSS-drawn assets.
  // ──────────────────────────────────────────────────────────────────────────
  import { onMount } from 'svelte';
  import { getCvData, getUi } from '$lib/i18n';
  import { pixelBlip, pixelDiscover, pixelFanfare, pixelCoin, pixelBump, pixelSecret } from '$lib/audio';
  import { trackEvent, trackTag } from '$lib/analytics';

  const cvData = getCvData();
  const t = getUi().pixel;

  type ZoneId = 'about' | 'experience' | 'skills' | 'education' | 'contact' | 'cv' | 'secret';
  type Kind = 'house' | 'castle' | 'shop' | 'library' | 'mailbox' | 'chest' | 'shrine';
  type Facing = 'down' | 'up' | 'left' | 'right';

  interface Zone {
    id: ZoneId;
    name: string;
    sub: string;
    kind: Kind;
    x: number;
    y: number;
    intro: string;
  }

  const MAP_W = 48;
  const MAP_H = 32;
  const STEP_MS = 50;

  // Zones laid out as a left→right journey, alternating top/bottom so the road
  // can snake between them. Order follows the CV narrative.
  const ZONES: Zone[] = [
    { id: 'about', name: t.zones.about.name, sub: t.zones.about.sub, kind: 'house', x: 8, y: 8, intro: t.zones.about.intro(cvData.name) },
    { id: 'experience', name: t.zones.experience.name, sub: t.zones.experience.sub, kind: 'castle', x: 16, y: 24, intro: t.zones.experience.intro },
    { id: 'skills', name: t.zones.skills.name, sub: t.zones.skills.sub, kind: 'shop', x: 24, y: 8, intro: t.zones.skills.intro },
    { id: 'education', name: t.zones.education.name, sub: t.zones.education.sub, kind: 'library', x: 32, y: 24, intro: t.zones.education.intro },
    { id: 'contact', name: t.zones.contact.name, sub: t.zones.contact.sub, kind: 'mailbox', x: 36, y: 10, intro: t.zones.contact.intro },
    { id: 'cv', name: t.zones.cv.name, sub: t.zones.cv.sub, kind: 'chest', x: 42, y: 20, intro: t.zones.cv.intro }
  ];

  // Hidden bonus zone — an RPG "hero stat sheet" that materialises in the grove
  // at the centre of the serpentine once every coin has been collected. Not part
  // of the ★ n/6 quest count.
  const SECRET: Zone = {
    id: 'secret',
    name: t.secret.name,
    sub: t.secret.sub,
    kind: 'shrine',
    x: 24,
    y: 16,
    intro: t.secret.intro
  };

  // Coins scattered along the road; gathering all of them reveals the secret zone.
  const COIN_SPOTS: { x: number; y: number }[] = [
    { x: 6, y: 16 }, { x: 12, y: 16 }, { x: 20, y: 16 }, { x: 28, y: 16 }, { x: 36, y: 16 }, { x: 38, y: 16 }
  ];
  const COINS_TOTAL = COIN_SPOTS.length;

  // Decorative wooden signpost beside the pond (top-right) — non-interactive,
  // just a playful nudge toward the fishing easter egg at the water.
  const POND_SIGN = { x: 38, y: 2, text: t.pondSign };

  const zoneById = (id: ZoneId) => (id === 'secret' ? SECRET : ZONES.find((z) => z.id === id)!);

  // Stat sheet for the secret zone — derived from the real CV data (no fabricated
  // content; just a playful RPG framing of the numbers).
  const heroStats = [
    { label: t.heroStats.class, value: cvData.role },
    { label: t.heroStats.years, value: String(new Date().getFullYear() - cvData.keyFigures.startYear) },
    { label: t.heroStats.products, value: String(cvData.keyFigures.products) },
    { label: t.heroStats.guilds, value: String(cvData.experience.length) },
    { label: t.heroStats.conferences, value: String(cvData.conferences.length) },
    { label: t.heroStats.languages, value: String(cvData.languages.length) },
    { label: t.heroStats.eras, value: '7' }
  ];

  // ── Terrain grid ────────────────────────────────────────────────────────────
  type Tile = 'grass' | 'grass2' | 'path' | 'water' | 'tree' | 'flower';
  const BLOCKED: Tile[] = ['water', 'tree'];

  function buildGrid(): Tile[][] {
    const g: Tile[][] = [];
    for (let y = 0; y < MAP_H; y++) {
      const row: Tile[] = [];
      for (let x = 0; x < MAP_W; x++) {
        const border = x <= 1 || y <= 1 || x >= MAP_W - 2 || y >= MAP_H - 2;
        row.push(border ? 'tree' : (x + y) % 2 === 0 ? 'grass' : 'grass2');
      }
      g.push(row);
    }
    const set = (x: number, y: number, t: Tile) => {
      if (x > 1 && y > 1 && x < MAP_W - 2 && y < MAP_H - 2) g[y][x] = t;
    };

    // ── Winding road: a single continuous serpentine left→right, passing the
    //    approach block of each zone in order. Drawn segment-by-segment between
    //    corner waypoints (each shares its turning tile with the next); every
    //    segment is brushed 2 tiles wide so corners close on themselves.
    const road: [number, number][] = [
      [4, 16],  // entrance (hero spawn)
      [8, 16],  // ┐
      [8, 10],  // ┘ pass below CASA (8,8)
      [12, 10], // ┐
      [12, 22], // ┘ descend
      [16, 22], // pass above CASTELLO (16,24)
      [20, 22], // ┐
      [20, 10], // ┘ climb
      [24, 10], // pass below BOTTEGA (24,8)
      [28, 10], // ┐
      [28, 22], // ┘ descend
      [32, 22], // pass above BIBLIOTECA (32,24)
      [36, 22], // ┐
      [36, 12], // ┘ climb
      [38, 12], // pass below POSTA (36,10)
      [38, 18], // ┐
      [42, 18]  // ┘ reach above SCRIGNO (42,20)
    ];
    for (let i = 0; i < road.length - 1; i++) {
      const [x1, y1] = road[i];
      const [x2, y2] = road[i + 1];
      if (x1 === x2) {
        for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
          set(x1, y, 'path');
          set(x1 + 1, y, 'path');
        }
      } else {
        for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
          set(x, y1, 'path');
          set(x, y1 + 1, 'path');
        }
      }
    }

    // Decorative pond (top-right corner, clear of the road and the POSTA sign)
    for (let y = 2; y <= 7; y++) for (let x = 40; x <= 45; x++) set(x, y, 'water');
    // Scattered trees (all off-road, framing the scene)
    for (const [x, y] of [
      [4, 6], [4, 10], [4, 22], [14, 4], [20, 4], [26, 4], [32, 4],
      [44, 10], [44, 16], [44, 24], [16, 6], [22, 16], [30, 16], [34, 16],
      [8, 26], [18, 26], [26, 26], [10, 26]
    ])
      set(x, y, 'tree');
    // Flowers (walkable flavour, dotted along the road)
    for (const [x, y] of [[10, 8], [22, 8], [34, 10], [14, 24], [30, 24], [40, 16], [6, 18]]) set(x, y, 'flower');
    // Plaza under each building (2×2 block, corner at z.x/z.y)
    for (const z of ZONES) {
      set(z.x, z.y, 'path');
      set(z.x + 1, z.y, 'path');
      set(z.x, z.y + 1, 'path');
      set(z.x + 1, z.y + 1, 'path');
    }
    return g;
  }

  const grid = buildGrid();
  // Every zone/shrine now occupies a 2×2 block anchored at (z.x, z.y).
  const inBlock = (z: { x: number; y: number }, x: number, y: number) =>
    x >= z.x && x <= z.x + 1 && y >= z.y && y <= z.y + 1;
  // Hero is orthogonally adjacent to a block's ring (not diagonally, not inside).
  const heroAdjacentTo = (z: { x: number; y: number }) => {
    const inX = hero.x >= z.x && hero.x <= z.x + 1;
    const inY = hero.y >= z.y && hero.y <= z.y + 1;
    return (inY && (hero.x === z.x - 1 || hero.x === z.x + 2)) || (inX && (hero.y === z.y - 1 || hero.y === z.y + 2));
  };
  const zoneAt = (x: number, y: number) => ZONES.find((z) => inBlock(z, x, y));
  function walkable(x: number, y: number): boolean {
    if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) return false;
    if (BLOCKED.includes(grid[y][x])) return false;
    if (zoneAt(x, y)) return false; // buildings are solid
    if (secretUnlocked && inBlock(SECRET, x, y)) return false; // so is the shrine
    return true;
  }

  // ── State ─────────────────────────────────────────────────────────────────
  let reduced = $state(false);
  // True on touch devices (where the on-screen D-pad / A-B buttons are shown):
  // there, walking next to a building does NOT auto-open it — the player must
  // tap A (or the building itself).
  let isTouch = $state(false);
  let viewW = $state(960);
  let viewH = $state(600);

  let hero = $state({ x: 4, y: 16 });
  let face = $state<Facing>('right');
  let stepFrame = $state(false);

  let visited = $state<ZoneId[]>([]);
  let activeZone = $state<ZoneId | null>(null);
  let directoryOpen = $state(false);
  let showHint = $state(true);
  let questShown = $state(false);
  let showQuest = $state(false);

  let typed = $state('');
  let skipType = false;

  // ── Easter eggs ──────────────────────────────────────────────────────────
  let nightMode = $state(false); // Konami code toggle
  let konamiToast = $state(false);
  let bumping = $state(false);
  let bumpDir = $state<Facing>('down');
  let idle = $state(false); // hero "Zzz" after standing still
  let coins = $state<{ x: number; y: number }[]>(COIN_SPOTS.map((c) => ({ ...c })));
  let secretUnlocked = $state(false);
  let secretToast = $state(false);
  let fishing = $state(false);
  let fishMsg = $state('');

  const coinsGot = $derived(COINS_TOTAL - coins.length);

  const KONAMI = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
  let konamiBuf: string[] = [];
  let bumpTimer: ReturnType<typeof setTimeout> | null = null;
  let idleTimer: ReturnType<typeof setTimeout> | null = null;
  let fishTimer: ReturnType<typeof setTimeout> | null = null;

  const tile = $derived(reduced ? 24 : Math.max(15, Math.min(26, Math.floor(Math.min(viewW / 26, viewH / 22)))));
  const worldW = $derived(MAP_W * tile);
  const worldH = $derived(MAP_H * tile);

  const camX = $derived(
    worldW <= viewW ? (worldW - viewW) / 2 : Math.max(0, Math.min(worldW - viewW, hero.x * tile + tile / 2 - viewW / 2))
  );
  const camY = $derived(
    worldH <= viewH ? (worldH - viewH) / 2 : Math.max(0, Math.min(worldH - viewH, hero.y * tile + tile / 2 - viewH / 2))
  );

  const questDone = $derived(ZONES.every((z) => visited.includes(z.id)));
  const currentZone = $derived(activeZone ? zoneById(activeZone) : null);

  // The shrine joins the rendered/interactive set only once unlocked.
  const visibleZones = $derived(secretUnlocked ? [...ZONES, SECRET] : ZONES);

  // True when the hero is facing an adjacent water tile (enables fishing).
  const facingWater = $derived.by(() => {
    if (reduced || fishing) return false;
    const [dx, dy] = DIRV[face];
    const fx = hero.x + dx;
    const fy = hero.y + dy;
    return fx >= 0 && fy >= 0 && fx < MAP_W && fy < MAP_H && grid[fy][fx] === 'water';
  });

  // Quest-complete celebration (fires once).
  $effect(() => {
    if (questDone && !questShown) {
      questShown = true;
      showQuest = true;
      trackEvent('pixel-quest-complete');
      pixelFanfare();
      setTimeout(() => (showQuest = false), 4200);
    }
  });

  // ── Movement ─────────────────────────────────────────────────────────────
  const DIRV: Record<Facing, [number, number]> = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const KEYDIR: Record<string, Facing> = {
    arrowup: 'up', w: 'up', arrowdown: 'down', s: 'down', arrowleft: 'left', a: 'left', arrowright: 'right', d: 'right'
  };

  const held = new Set<Facing>();
  let order: Facing[] = [];
  let stepping = false;
  let moveTimer: ReturnType<typeof setTimeout> | null = null;
  let prevAdjacent = $state<ZoneId[]>([]); // also read in the template (the "!" prompt bubble)

  const blockingOverlay = () => activeZone !== null || directoryOpen || showQuest;

  function currentDir(): Facing | null {
    for (let i = order.length - 1; i >= 0; i--) if (held.has(order[i])) return order[i];
    return null;
  }

  function startStepping() {
    if (stepping || reduced) return;
    stepping = true;
    stepLoop();
  }

  function stepLoop() {
    const dir = currentDir();
    if (!dir || blockingOverlay()) {
      stepping = false;
      return;
    }
    face = dir;
    const [dx, dy] = DIRV[dir];
    const nx = hero.x + dx;
    const ny = hero.y + dy;
    if (walkable(nx, ny)) {
      hero = { x: nx, y: ny };
      stepFrame = !stepFrame;
      pokeIdle();
      collectCoinAt(nx, ny);
      checkAdjacency();
    } else {
      bump(dir);
    }
    moveTimer = setTimeout(stepLoop, STEP_MS);
  }

  // ── Bump feedback (walking into a wall/tree/water) ──────────────────────
  function bump(dir: Facing) {
    if (bumping) return; // throttle: one cue per contact
    bumping = true;
    bumpDir = dir;
    pixelBump();
    if (bumpTimer) clearTimeout(bumpTimer);
    bumpTimer = setTimeout(() => (bumping = false), 200);
  }

  // ── Idle "Zzz" (hero dozes off when left standing) ──────────────────────
  function pokeIdle() {
    idle = false;
    if (idleTimer) clearTimeout(idleTimer);
    if (reduced) return;
    idleTimer = setTimeout(() => {
      if (!blockingOverlay()) idle = true;
    }, 4500);
  }

  // ── Coins → secret zone ─────────────────────────────────────────────────
  function collectCoinAt(x: number, y: number) {
    const i = coins.findIndex((c) => inBlock(c, x, y));
    if (i === -1) return;
    coins = coins.filter((_, j) => j !== i);
    pixelCoin();
    if (coins.length === 0 && !secretUnlocked) {
      secretUnlocked = true;
      secretToast = true;
      trackEvent('pixel-secret-unlock');
      pixelSecret();
      setTimeout(() => (secretToast = false), 4200);
    }
  }

  function checkAdjacency() {
    const now: ZoneId[] = [];
    for (const z of visibleZones) {
      if (heroAdjacentTo(z)) now.push(z.id);
    }
    // Trigger on the not-adjacent → adjacent transition only.
    const fresh = now.find((id) => !prevAdjacent.includes(id));
    prevAdjacent = now;
    // On touch the on-screen buttons drive interaction: getting adjacent only
    // raises the "!" prompt, and the player opens the zone with A (or a tap).
    // On desktop/keyboard the adjacency still auto-opens the dialog.
    if (fresh && !isTouch) openZone(fresh);
  }

  // Konami code (↑↑↓↓←→←→ B A). Fed from BOTH the keyboard and the touch pad,
  // so the easter egg is reachable on mobile (D-pad directions + B + A).
  function feedKonami(token: string) {
    konamiBuf.push(token);
    if (konamiBuf.length > KONAMI.length) konamiBuf.shift();
    if (konamiBuf.length === KONAMI.length && konamiBuf.every((v, i) => v === KONAMI[i])) {
      triggerKonami();
      konamiBuf = [];
    }
  }

  function onKeyDown(e: KeyboardEvent) {
    const k = e.key.toLowerCase();
    feedKonami(k); // tracked regardless of dialog state

    // Escape always closes; Enter advances the typewriter first, then closes
    // (classic NES dialog feel).
    if (k === 'escape' || k === 'enter') {
      if (activeZone) {
        e.preventDefault();
        if (k === 'enter' && currentZone && typed !== currentZone.intro) {
          skipType = true;
        } else {
          closeZone();
        }
      } else if (directoryOpen) {
        directoryOpen = false;
      }
      return;
    }
    if (blockingOverlay()) return;

    // Fishing (F or Space) when facing water.
    if (k === 'f' || k === ' ') {
      e.preventDefault();
      tryFish();
      return;
    }

    const dir = KEYDIR[k];
    if (!dir) return;
    e.preventDefault();
    dismissHint();
    pokeIdle();
    if (!held.has(dir)) {
      held.add(dir);
      order.push(dir);
    }
    face = dir;
    startStepping();
  }

  function triggerKonami() {
    nightMode = !nightMode;
    konamiToast = true;
    trackEvent('pixel-konami');
    pixelFanfare();
    setTimeout(() => (konamiToast = false), 2600);
  }

  // ── Fishing (easter egg at the pond) ─────────────────────────────────────
  const FISH_CATCHES = t.fishCatches;

  function tryFish() {
    if (fishing || !facingWater) return;
    fishing = true;
    fishMsg = t.fishCasting;
    pixelBlip();
    if (fishTimer) clearTimeout(fishTimer);
    fishTimer = setTimeout(() => {
      const catchText = FISH_CATCHES[Math.floor(Math.random() * FISH_CATCHES.length)];
      fishMsg = catchText;
      trackEvent('pixel-fish-catch');
      if (catchText.includes('✨') || catchText.includes('🎮')) pixelDiscover();
      else pixelBlip();
      fishTimer = setTimeout(() => (fishing = false), 2400);
    }, 1100);
  }

  function onKeyUp(e: KeyboardEvent) {
    const dir = KEYDIR[e.key.toLowerCase()];
    if (dir) held.delete(dir);
  }

  // On-screen D-pad (touch): press-and-hold to walk.
  function dpadDown(dir: Facing) {
    if (blockingOverlay()) return;
    dismissHint();
    pokeIdle();
    feedKonami('arrow' + dir); // up/down/left/right → arrowup/… for the mobile Konami
    if (!held.has(dir)) {
      held.add(dir);
      order.push(dir);
    }
    face = dir;
    startStepping();
  }
  const dpadUp = (dir: Facing) => held.delete(dir);

  // ── A / B action buttons (touch, Game Boy style) ──────────────────────────
  // A = confirm/interact: advance then close the dialog (like Enter), cast the
  // fishing line when facing water, or open the zone you're standing next to.
  // B = back: close the open dialog or the directory (like Escape).
  function pressA() {
    feedKonami('a');
    dismissHint();
    if (activeZone) {
      if (currentZone && typed !== currentZone.intro) skipType = true;
      else closeZone();
      return;
    }
    if (directoryOpen || showQuest) return;
    if (facingWater) {
      tryFish();
      return;
    }
    const adj = visibleZones.find((z) => heroAdjacentTo(z));
    if (adj) openZone(adj.id);
  }
  function pressB() {
    feedKonami('b');
    if (activeZone) {
      closeZone();
      return;
    }
    if (directoryOpen) directoryOpen = false;
  }

  // ── Zone panels ─────────────────────────────────────────────────────────
  const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

  async function openZone(id: ZoneId) {
    const first = !visited.includes(id);
    if (first) visited = [...visited, id];
    if (first) {
      trackEvent('pixel-zone-open');
      trackTag('pixel-zone', id);
    }
    activeZone = id;
    held.clear();
    if (first) pixelDiscover();
    else pixelBlip();
    await typeIntro(zoneById(id).intro);
  }

  async function typeIntro(text: string) {
    skipType = false;
    if (reduced) {
      typed = text;
      return;
    }
    typed = '';
    for (let i = 1; i <= text.length; i++) {
      if (skipType) {
        typed = text;
        break;
      }
      typed = text.slice(0, i);
      await delay(13);
    }
  }

  function closeZone() {
    activeZone = null;
    // Re-arm so standing still next to a building doesn't immediately reopen it,
    // but walking away and back will. (prevAdjacent already reflects current.)
  }

  function openFromDirectory(id: ZoneId) {
    directoryOpen = false;
    openZone(id);
  }

  function dismissHint() {
    showHint = false;
  }

  function downloadCV() {
    const link = document.createElement('a');
    link.href = '/cv-stefano-tedeschi.pdf';
    link.download = 'Stefano_Tedeschi_CV.pdf';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  onMount(() => {
    reduced =
      typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Mirror the CSS query that reveals the touch controls (.dpad / .ab-pad are
    // hidden when the pointer is fine + hover-capable) so we can require manual
    // interaction instead of auto-opening zones on approach.
    const fineMq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const updateTouch = () => (isTouch = !fineMq.matches);
    updateTouch();
    fineMq.addEventListener('change', updateTouch);

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    const onBlur = () => held.clear();
    window.addEventListener('blur', onBlur);
    setTimeout(() => (showHint = false), 6000);
    pokeIdle();

    return () => {
      fineMq.removeEventListener('change', updateTouch);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      if (moveTimer) clearTimeout(moveTimer);
      if (bumpTimer) clearTimeout(bumpTimer);
      if (idleTimer) clearTimeout(idleTimer);
      if (fishTimer) clearTimeout(fishTimer);
    };
  });
</script>

<div class="pixel-wrapper" bind:clientWidth={viewW} bind:clientHeight={viewH}>
  <!-- HUD -->
  <div class="hud">
    <div class="hud-box title">{cvData.name.toUpperCase()}</div>
    <div class="hud-right">
      {#if !reduced}<div class="hud-box coins" class:done={secretUnlocked}>● {coinsGot}/{COINS_TOTAL}</div>{/if}
      <div class="hud-box quest" class:done={questDone}>★ {visited.filter((id) => id !== 'secret').length}/{ZONES.length}</div>
      <button
        class="hud-box menu-btn"
        onclick={() => {
          directoryOpen = true;
          trackEvent('pixel-show-all');
        }}>{t.showAll}</button
      >
    </div>
  </div>

  {#if !reduced}
    <!-- ── Interactive overworld ─────────────────────────────────────────── -->
    <div class="viewport">
      <div
        class="world"
        style="--tile:{tile}px; --px:{tile / 32}px; --step:{STEP_MS}ms; width:{worldW}px; height:{worldH}px; transform: translate({-camX}px, {-camY}px);"
      >
        {#each grid as row, y}
          {#each row as t, x}
            <div class="tile {t}" style="left:{x * tile}px; top:{y * tile}px;"></div>
          {/each}
        {/each}

        <!-- Collectible coins -->
        {#each coins as c (c.x + '-' + c.y)}
          <span class="coin" style="left:{c.x * tile}px; top:{c.y * tile}px;"></span>
        {/each}

        <!-- Decorative wooden sign by the pond (non-interactive) -->
        <div class="signpost" style="left:{POND_SIGN.x * tile}px; top:{POND_SIGN.y * tile}px;" aria-hidden="true">
          <span class="sign wood">{POND_SIGN.text}</span>
          <span class="post-pole"></span>
        </div>

        <!-- Zones (also clickable buttons — content without playing) -->
        {#each visibleZones as z (z.id)}
          <button
            class="zone"
            style="left:{z.x * tile}px; top:{z.y * tile}px;"
            onclick={() => openZone(z.id)}
            aria-label="{z.name}: {z.sub}"
          >
            <span class="sign" class:visited={visited.includes(z.id)}>{z.name}</span>
            {#if prevAdjacent.includes(z.id) && activeZone !== z.id}
              <span class="bubble">!</span>
            {/if}
            <span class="building b-{z.kind}" class:sparkle={(z.id === 'cv' && questDone) || z.id === 'secret'}>
              {#if z.kind === 'house'}
                <span class="roof"></span><span class="chimney"></span><span class="wall"></span><span class="door"></span><span class="win l"></span><span class="win r"></span>
              {:else if z.kind === 'castle'}
                <span class="tower l"></span><span class="tower r"></span><span class="keep"></span><span class="merlons"></span><span class="gate"></span><span class="flag"></span>
              {:else if z.kind === 'shop'}
                <span class="awning"></span><span class="wall"></span><span class="board"></span><span class="win"></span><span class="door"></span>
              {:else if z.kind === 'library'}
                <span class="pediment"></span><span class="cols"></span><span class="steps"></span><span class="gate"></span>
              {:else if z.kind === 'mailbox'}
                <span class="post"></span><span class="box"></span><span class="slot"></span><span class="mflag"></span>
              {:else if z.kind === 'chest'}
                <span class="lid"></span><span class="base"></span><span class="bands"></span><span class="lock"></span>
              {:else if z.kind === 'shrine'}
                <span class="base"></span><span class="pillar"></span><span class="orb"></span>
              {/if}
            </span>
          </button>
        {/each}

        <!-- Hero -->
        <div class="hero" class:bump={bumping} class:bump-up={bumping && bumpDir === 'up'} class:bump-down={bumping && bumpDir === 'down'} class:bump-left={bumping && bumpDir === 'left'} class:bump-right={bumping && bumpDir === 'right'} style="--hx:{hero.x * tile}px; --hy:{hero.y * tile}px;">
          <span class="hero-shadow"></span>
          {#if idle}<span class="zzz">Z</span>{/if}
          {#if facingWater}<span class="fish-hint">🎣 F</span>{/if}
          <span class="hero-sprite facing-{face === 'left' ? 'right' : face}" class:flip={face === 'left'} class:step={stepFrame}>
            <span class="h-hat-top"></span>
            <span class="h-hat-brim"></span>
            <span class="h-face"></span>
            <span class="h-eye l"></span>
            <span class="h-eye r"></span>
            <span class="h-arm l"></span>
            <span class="h-arm r"></span>
            <span class="h-body"></span>
            <span class="h-body-shade"></span>
            <span class="h-belt"></span>
            <span class="h-buckle"></span>
            <span class="h-leg l"></span>
            <span class="h-leg r"></span>
            <span class="h-boot l"></span>
            <span class="h-boot r"></span>
          </span>
        </div>
      </div>

      {#if nightMode}<div class="night-overlay" aria-hidden="true"></div>{/if}

      {#if showHint}
        <div class="controls-hint">{t.controlsHint}</div>
      {/if}

      {#if fishing}
        <div class="fish-toast" role="status">{fishMsg}</div>
      {/if}

      <!-- Touch D-pad (left) -->
      <div class="dpad" aria-hidden="true">
        <button class="d up" onpointerdown={() => dpadDown('up')} onpointerup={() => dpadUp('up')} onpointerleave={() => dpadUp('up')}>▲</button>
        <button class="d left" onpointerdown={() => dpadDown('left')} onpointerup={() => dpadUp('left')} onpointerleave={() => dpadUp('left')}>◄</button>
        <button class="d right" onpointerdown={() => dpadDown('right')} onpointerup={() => dpadUp('right')} onpointerleave={() => dpadUp('right')}>►</button>
        <button class="d down" onpointerdown={() => dpadDown('down')} onpointerup={() => dpadUp('down')} onpointerleave={() => dpadUp('down')}>▼</button>
      </div>

      <!-- A / B action buttons (right) -->
      <div class="ab-pad" aria-hidden="true">
        <button class="ab b" onpointerdown={pressB}>B</button>
        <button class="ab a" onpointerdown={pressA}>A</button>
      </div>
    </div>
  {:else}
    <!-- ── Reduced-motion fallback: static zone directory ───────────────── -->
    <div class="static-village">
      <p class="village-lead">{t.villageLead}</p>
      <div class="zone-grid">
        {#each ZONES as z}
          <button class="zone-card" onclick={() => openZone(z.id)}>
            <span class="zc-name">{z.name}</span>
            <span class="zc-sub">{z.sub}</span>
            {#if visited.includes(z.id)}<span class="zc-done">{t.visited}</span>{/if}
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <!-- ── Zone directory overlay (always available — dual track) ────────── -->
  {#if directoryOpen}
    <div class="overlay" role="dialog" aria-modal="true" aria-label={t.allZones}>
      <button class="backdrop" aria-label={t.close} onclick={() => (directoryOpen = false)}></button>
      <div class="nes-panel directory">
        <div class="panel-bar"><span>{t.villageMap}</span><button class="x" onclick={() => (directoryOpen = false)} aria-label={t.close}>✕</button></div>
        <div class="panel-body">
          <div class="zone-grid">
            {#each ZONES as z}
              <button class="zone-card" onclick={() => openFromDirectory(z.id)}>
                <span class="zc-name">{z.name}</span>
                <span class="zc-sub">{z.sub}</span>
                {#if visited.includes(z.id)}<span class="zc-done">{t.visited}</span>{/if}
              </button>
            {/each}
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- ── Zone content (NES dialog box) ─────────────────────────────────── -->
  {#if currentZone}
    <div class="overlay" role="dialog" aria-modal="true" aria-label={currentZone.name}>
      <button class="backdrop" aria-label={t.close} onclick={closeZone}></button>
      <div class="nes-panel dialog" onclick={() => (skipType = true)} role="presentation">
        <div class="panel-bar"><span>{currentZone.name} · {currentZone.sub}</span><button class="x" onclick={closeZone} aria-label={t.close}>✕</button></div>
        <div class="panel-body">
          <p class="intro">{typed}<span class="caret">▋</span></p>

          {#if currentZone.id === 'about'}
            <p class="role">{cvData.role}</p>
            <p class="tagline">“{cvData.tagline}”</p>
            <p class="summary">{cvData.summary}</p>

          {:else if currentZone.id === 'experience'}
            <div class="rooms">
              {#each cvData.experience as exp, i}
                <div class="room">
                  <div class="room-head"><span class="floor">{t.floor(cvData.experience.length - i)}</span><span class="period">{exp.period}</span></div>
                  <p class="job-title">{exp.title}</p>
                  <p class="job-co">{exp.company}{exp.sector ? ` · ${exp.sector}` : ''}</p>
                  <p class="job-desc">{exp.description}</p>
                  <ul class="hl">
                    {#each exp.highlights as h}<li>{h}</li>{/each}
                  </ul>
                  <div class="tags">{#each exp.technologies as t}<span class="tag">{t}</span>{/each}</div>
                </div>
              {/each}
              <div class="room">
                <div class="room-head"><span class="floor">{t.foundations}</span><span class="period">{cvData.earlyCareer.period}</span></div>
                <p class="job-title">{cvData.earlyCareer.title}</p>
                <p class="job-desc">{cvData.earlyCareer.description}</p>
                <ul class="hl">{#each cvData.earlyCareer.highlights as h}<li>{h}</li>{/each}</ul>
                <div class="tags">{#each cvData.earlyCareer.technologies as t}<span class="tag">{t}</span>{/each}</div>
              </div>
            </div>

          {:else if currentZone.id === 'skills'}
            <div class="bags">
              {#each cvData.skillGroups as group}
                <div class="bag">
                  <p class="bag-label">{group.label}</p>
                  <div class="tags">{#each group.items as item}<span class="tag powerup">{item}</span>{/each}</div>
                </div>
              {/each}
              <div class="bag">
                <p class="bag-label">{t.languages}</p>
                <div class="tags">{#each cvData.languages as l}<span class="tag">{l.name}: {l.level}</span>{/each}</div>
              </div>
            </div>

          {:else if currentZone.id === 'education'}
            <p class="bag-label">{t.education}</p>
            {#each cvData.education as ed}
              <div class="book"><p class="job-title">{ed.title}</p><p class="job-co">{ed.institute} · {ed.location} · {ed.period}</p></div>
            {/each}
            <p class="bag-label">{t.conferences}</p>
            <ul class="hl">{#each cvData.conferences as c}<li>{c.name} — {c.location} ({c.year})</li>{/each}</ul>

          {:else if currentZone.id === 'contact'}
            <div class="links">
              <a class="link" href="mailto:{cvData.contact.email}">✉ {cvData.contact.email}</a>
              <a class="link" href={cvData.contact.linkedin} target="_blank" rel="noopener noreferrer">{t.linkedin}</a>
              <a class="link" href={cvData.contact.website} target="_blank" rel="noopener noreferrer">{t.website(cvData.contact.website)}</a>
              <a class="link" href="tel:{cvData.contact.phone.replace(/\s/g, '')}">☎ {cvData.contact.phone}</a>
              <p class="job-co">📍 {cvData.contact.location}</p>
            </div>

          {:else if currentZone.id === 'cv'}
            <p class="summary">{t.cvLead}</p>
            {#if questDone}<p class="quest-note">{t.questNote}</p>{/if}
            <button class="cv-btn" onclick={downloadCV}>{t.downloadCv}</button>

          {:else if currentZone.id === 'secret'}
            <p class="role">{t.secretFound}</p>
            <div class="stats">
              {#each heroStats as s}
                <div class="stat"><span class="stat-label">{s.label}</span><span class="stat-value">{s.value}</span></div>
              {/each}
            </div>
            <p class="quest-note">{t.secretQuote}</p>
          {/if}
        </div>
      </div>
    </div>
  {/if}

  <!-- ── Quest complete banner ─────────────────────────────────────────── -->
  {#if showQuest}
    <div class="quest-banner" role="status"><span>{t.questBanner}</span><small>{t.questBannerSub}</small></div>
  {/if}

  <!-- ── Easter-egg toasts ─────────────────────────────────────────────── -->
  {#if konamiToast}
    <div class="egg-toast konami" role="status"><span>{t.cheatTitle}</span><small>{nightMode ? t.nightOn : t.nightOff}</small></div>
  {/if}
  {#if secretToast}
    <div class="egg-toast secret" role="status"><span>{t.secretTitle}</span><small>{t.secretToastSub}</small></div>
  {/if}
</div>

<style>
  /* ─── NES palette ───────────────────────────────────────────────────────
     grass #00A800/#008000 · path #C84C0C · water #5C94FC · coin #FCD800
     hero red #D82800 / cap green #1F9E3A · UI white #FCFCFC · sky/ink #1C1C2E
     Pixel grid is tile/32 (--px) — twice as fine as a classic tile/8.        */
  .pixel-wrapper {
    width: 100%;
    height: 100vh;
    height: 100dvh;
    position: relative;
    overflow: hidden;
    background: #1c1c2e;
    font-family: 'Press Start 2P', 'JetBrains Mono', monospace;
    color: #fcfcfc;
    image-rendering: pixelated;
    -webkit-font-smoothing: none;
  }

  /* ── HUD ─────────────────────────────────────────────────────────────── */
  .hud {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 60;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 12px;
    pointer-events: none;
  }
  .hud-right { display: flex; gap: 8px; pointer-events: auto; }
  .hud-box {
    background: #1c1c2e;
    border: 3px solid #fcfcfc;
    box-shadow: 3px 3px 0 #000;
    color: #fcfcfc;
    font-size: 0.62rem;
    line-height: 1.4;
    padding: 8px 10px;
    text-transform: uppercase;
  }
  .hud-box.title { color: #fcd800; }
  .hud-box.quest.done { color: #fcd800; border-color: #fcd800; }
  .hud-box.coins { color: #ffe840; }
  .hud-box.coins.done { color: #5cf0a0; border-color: #5cf0a0; }
  .menu-btn { cursor: pointer; font-family: inherit; }
  .menu-btn:hover { background: #2b39ff; }
  .menu-btn:active { transform: translate(1px, 1px); box-shadow: 2px 2px 0 #000; }

  /* ── Overworld ───────────────────────────────────────────────────────── */
  .viewport { position: absolute; inset: 0; overflow: hidden; }
  .world {
    position: absolute;
    top: 0;
    left: 0;
    transition: transform var(--step) linear;
    image-rendering: pixelated;
  }
  @media (prefers-reduced-motion: reduce) {
    .world { transition: none; }
  }

  .tile { position: absolute; width: var(--tile); height: var(--tile); image-rendering: pixelated; }

  /* Grass — two alternating shades, each speckled with a few darker/lighter tufts */
  .tile.grass { background: #00a800; }
  .tile.grass::after {
    content: '';
    position: absolute;
    left: calc(var(--px) * 8);
    top: calc(var(--px) * 10);
    width: calc(var(--px) * 2);
    height: calc(var(--px) * 2);
    background: #008000;
    box-shadow:
      calc(var(--px) * 16) calc(var(--px) * 8) #008000,
      calc(var(--px) * 10) calc(var(--px) * 20) #38c456,
      calc(var(--px) * 22) calc(var(--px) * 18) #008000,
      calc(var(--px) * 5) calc(var(--px) * 27) #38c456,
      calc(var(--px) * 27) calc(var(--px) * 13) #008000;
  }
  .tile.grass2 { background: #089808; }
  .tile.grass2::after {
    content: '';
    position: absolute;
    left: calc(var(--px) * 6);
    top: calc(var(--px) * 16);
    width: calc(var(--px) * 2);
    height: calc(var(--px) * 2);
    background: #006c00;
    box-shadow:
      calc(var(--px) * 18) calc(var(--px) * 6) #006c00,
      calc(var(--px) * 24) calc(var(--px) * 20) #2cb44a,
      calc(var(--px) * 12) calc(var(--px) * 24) #006c00,
      calc(var(--px) * 3) calc(var(--px) * 27) #2cb44a,
      calc(var(--px) * 27) calc(var(--px) * 15) #006c00;
  }

  /* Dirt road — warm base, lighter top edge, scattered pebbles */
  .tile.path { background: #c84c0c; box-shadow: inset 0 0 0 calc(var(--px) * 3) #b03c08, inset 0 calc(var(--px) * 3) 0 #e06820; }
  .tile.path::after {
    content: '';
    position: absolute;
    left: calc(var(--px) * 6);
    top: calc(var(--px) * 8);
    width: calc(var(--px) * 2);
    height: calc(var(--px) * 2);
    background: #a83408;
    box-shadow:
      calc(var(--px) * 16) calc(var(--px) * 4) #e06820,
      calc(var(--px) * 8) calc(var(--px) * 18) #a83408,
      calc(var(--px) * 22) calc(var(--px) * 22) #e06820,
      calc(var(--px) * 24) calc(var(--px) * 10) #a83408,
      calc(var(--px) * 13) calc(var(--px) * 27) #e06820,
      calc(var(--px) * 3) calc(var(--px) * 25) #a83408,
      calc(var(--px) * 27) calc(var(--px) * 15) #e06820;
  }

  /* Water — banded shading + ripple highlights */
  .tile.water { background: #5c94fc; box-shadow: inset 0 calc(var(--px) * 4) 0 #78a8fc, inset 0 calc(var(--px) * -4) 0 #3868c0; }
  .tile.water::before {
    content: '';
    position: absolute;
    left: calc(var(--px) * 3);
    top: calc(var(--px) * 5);
    width: calc(var(--px) * 6);
    height: calc(var(--px) * 1);
    background: #bcd4fc;
    box-shadow: calc(var(--px) * 16) calc(var(--px) * 3) #dcecff, calc(var(--px) * 11) calc(var(--px) * 9) #bcd4fc;
  }
  .tile.water::after {
    content: '';
    position: absolute;
    left: calc(var(--px) * 6);
    top: calc(var(--px) * 12);
    width: calc(var(--px) * 10);
    height: calc(var(--px) * 2);
    background: #bcd4fc;
    box-shadow: calc(var(--px) * 14) calc(var(--px) * 8) #bcd4fc, calc(var(--px) * -2) calc(var(--px) * 10) #bcd4fc;
  }

  /* Flowers — walkable; a couple of little blooms on grass */
  .tile.flower { background: #00a800; }
  .tile.flower::after {
    content: '';
    position: absolute;
    left: calc(var(--px) * 12);
    top: calc(var(--px) * 12);
    width: calc(var(--px) * 4);
    height: calc(var(--px) * 4);
    background: #fcd800;
    box-shadow:
      calc(var(--px) * 4) 0 #fc7460,
      calc(var(--px) * -4) 0 #fc7460,
      0 calc(var(--px) * 4) #fc7460,
      0 calc(var(--px) * -4) #fc7460,
      calc(var(--px) * 8) calc(var(--px) * 8) #f850a0,
      inset 0 0 0 calc(var(--px) * 1) #e0a800;
  }

  /* Trees — trunk (::before) + layered canopy (::after) */
  .tile.tree { background: #00a800; }
  .tile.tree::before {
    content: '';
    position: absolute;
    left: 50%;
    bottom: calc(var(--px) * 2);
    transform: translateX(-50%);
    width: calc(var(--px) * 6);
    height: calc(var(--px) * 10);
    background: #6a3b10;
    box-shadow: inset calc(var(--px) * -2) 0 0 #4a2608, inset calc(var(--px) * 1) 0 0 #7c4a18;
  }
  .tile.tree::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: calc(var(--px) * 8);
    transform: translateX(-50%);
    width: calc(var(--px) * 24);
    height: calc(var(--px) * 24);
    background: #1d8a2c;
    box-shadow: inset 0 calc(var(--px) * -4) 0 #0d5a1c, inset 0 calc(var(--px) * 6) 0 #2cb44a, inset calc(var(--px) * -5) calc(var(--px) * -3) 0 #14691f;
  }

  /* ── Zones (buildings) ───────────────────────────────────────────────── */
  .zone {
    --px: calc(var(--tile) / 16);
    position: absolute;
    width: calc(var(--tile) * 2);
    height: calc(var(--tile) * 2);
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    z-index: 5;
  }
  .sign {
    position: absolute;
    bottom: calc(100% + var(--tile) * 1.8);
    left: 50%;
    transform: translateX(-50%);
    white-space: nowrap;
    background: #1c1c2e;
    border: 3px solid #fcfcfc;
    box-shadow: 2px 2px 0 #000;
    color: #fcfcfc;
    font-family: 'Silkscreen', 'Press Start 2P', monospace;
    font-weight: 700;
    font-size: 0.78rem;
    letter-spacing: 0.5px;
    line-height: 1;
    padding: 5px 8px;
    z-index: 7;
  }
  .sign.visited { color: #fcd800; border-color: #fcd800; }

  /* Decorative wooden signpost by the pond (board on a short post) */
  .signpost { --px: calc(var(--tile) / 16); position: absolute; width: var(--tile); height: var(--tile); z-index: 4; pointer-events: none; }
  .signpost > span { position: absolute; image-rendering: pixelated; }
  .post-pole {
    left: 50%;
    bottom: 0;
    transform: translateX(-50%);
    width: calc(var(--px) * 6);
    height: calc(var(--px) * 20);
    background: #7a5224;
    box-shadow: inset 0 0 0 calc(var(--px) * 2) #5e3c18, inset calc(var(--px) * -2) 0 0 #6e481f;
  }
  .sign.wood {
    bottom: calc(var(--px) * 16);
    background: #7a5224;
    border-color: #d2a05a;
    color: #ffe6b0;
    box-shadow: 2px 2px 0 #000, inset 0 calc(var(--px) * 4) 0 #9c6c33;
    font-size: 0.58rem;
  }
  .bubble {
    position: absolute;
    bottom: calc(100% + var(--tile) * 2.9);
    left: 50%;
    transform: translateX(-50%);
    width: calc(var(--px) * 16);
    height: calc(var(--px) * 16);
    background: #fcd800;
    color: #1c1c2e;
    border: 2px solid #1c1c2e;
    font-size: 0.55rem;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 8;
    animation: bob 0.6s steps(2, end) infinite;
  }
  @keyframes bob {
    0%, 100% { transform: translateX(-50%) translateY(0); }
    50% { transform: translateX(-50%) translateY(calc(var(--px) * -6)); }
  }
  @media (prefers-reduced-motion: reduce) {
    .bubble { animation: none; }
  }

  /* Building bodies are anchored to the bottom of their tile and overhang upward. */
  .building {
    position: absolute;
    left: 50%;
    bottom: 0;
    transform: translateX(-50%);
    width: calc(var(--px) * 52);
    height: calc(var(--px) * 60);
  }
  .building > span { position: absolute; image-rendering: pixelated; }

  /* House — warm cottage: pitched roof, chimney, framed windows */
  .b-house .roof {
    bottom: calc(var(--px) * 26);
    left: calc(var(--px) * 2);
    width: 0;
    height: 0;
    border-left: calc(var(--px) * 24) solid transparent;
    border-right: calc(var(--px) * 24) solid transparent;
    border-bottom: calc(var(--px) * 18) solid #c0341a;
    filter: drop-shadow(0 calc(var(--px) * -2) 0 #e05030);
  }
  .b-house .chimney { bottom: calc(var(--px) * 36); left: calc(var(--px) * 32); width: calc(var(--px) * 6); height: calc(var(--px) * 12); background: #8a3010; box-shadow: inset 0 0 0 calc(var(--px) * 2) #5a2008; }
  .b-house .wall { bottom: 0; left: calc(var(--px) * 8); width: calc(var(--px) * 36); height: calc(var(--px) * 26); background: #f0a040; box-shadow: inset 0 0 0 calc(var(--px) * 2) #b06010, inset 0 calc(var(--px) * -4) 0 #d4842c, inset 0 calc(var(--px) * 3) 0 #a85808; }
  .b-house .door { bottom: 0; left: calc(var(--px) * 20); width: calc(var(--px) * 12); height: calc(var(--px) * 16); background: #6a3410; box-shadow: inset 0 0 0 calc(var(--px) * 2) #4a2208, inset calc(var(--px) * -4) 0 0 #7c421a; }
  .b-house .door::after { content: ''; position: absolute; right: calc(var(--px) * 2); top: calc(var(--px) * 7); width: calc(var(--px) * 2); height: calc(var(--px) * 2); background: #fcd800; }
  .b-house .win { bottom: calc(var(--px) * 16); width: calc(var(--px) * 8); height: calc(var(--px) * 8); background: #5c94fc; box-shadow: inset 0 0 0 calc(var(--px) * 2) #e8d8b0, inset calc(var(--px) * 3) 0 0 #3868c0; }
  .b-house .win::before { content: ''; position: absolute; left: 0; top: calc(var(--px) * 3); width: calc(var(--px) * 8); height: calc(var(--px) * 1); background: #e8d8b0; }
  .b-house .win::after { content: ''; position: absolute; left: calc(var(--px) * 3); top: 0; width: calc(var(--px) * 1); height: calc(var(--px) * 8); background: #e8d8b0; }
  .b-house .win.l { left: calc(var(--px) * 11); }
  .b-house .win.r { left: calc(var(--px) * 25); }

  /* Castle — twin towers, crenellated keep, portcullis gate, pennant */
  .b-castle { height: calc(var(--px) * 60); }
  .b-castle .keep { bottom: 0; left: calc(var(--px) * 10); width: calc(var(--px) * 32); height: calc(var(--px) * 40); background: #9aa0ac; box-shadow: inset 0 0 0 calc(var(--px) * 2) #6c7280, inset 0 calc(var(--px) * -6) 0 #80868f; }
  .b-castle .keep::before { content: ''; position: absolute; left: calc(var(--px) * 2); top: calc(var(--px) * 8); width: calc(var(--px) * 28); height: calc(var(--px) * 1); background: #6c7280; box-shadow: 0 calc(var(--px) * 10) #6c7280, 0 calc(var(--px) * 20) #6c7280; }
  .b-castle .keep::after { content: ''; position: absolute; left: 50%; transform: translateX(-50%); top: calc(var(--px) * 11); width: calc(var(--px) * 3); height: calc(var(--px) * 10); background: #3a3e48; }
  .b-castle .tower { bottom: 0; width: calc(var(--px) * 12); height: calc(var(--px) * 48); background: #aab0bc; box-shadow: inset 0 0 0 calc(var(--px) * 2) #6c7280, inset 0 calc(var(--px) * 4) 0 #5c6068; }
  .b-castle .tower.l { left: 0; }
  .b-castle .tower.r { left: calc(var(--px) * 40); }
  .b-castle .merlons { bottom: calc(var(--px) * 40); left: calc(var(--px) * 10); width: calc(var(--px) * 32); height: calc(var(--px) * 6); background: repeating-linear-gradient(90deg, #aab0bc 0 calc(var(--px) * 6), transparent calc(var(--px) * 6) calc(var(--px) * 10)); box-shadow: inset 0 calc(var(--px) * -1) 0 #6c7280; }
  .b-castle .gate { bottom: 0; left: calc(var(--px) * 20); width: calc(var(--px) * 12); height: calc(var(--px) * 20); background: repeating-linear-gradient(90deg, #2a1c44 0 calc(var(--px) * 3), #160e2c calc(var(--px) * 3) calc(var(--px) * 4)); box-shadow: inset 0 0 0 calc(var(--px) * 2) #160e2c; }
  .b-castle .flag { bottom: calc(var(--px) * 50); left: calc(var(--px) * 22); width: calc(var(--px) * 12); height: calc(var(--px) * 6); background: #d82800; box-shadow: inset calc(var(--px) * 2) 0 0 #fcfcfc; }

  /* Shop — striped awning, signboard, framed window */
  .b-shop .wall { bottom: 0; left: calc(var(--px) * 6); width: calc(var(--px) * 40); height: calc(var(--px) * 24); background: #f0e0c0; box-shadow: inset 0 0 0 calc(var(--px) * 2) #c0a070, inset 0 calc(var(--px) * -4) 0 #d8c498; }
  .b-shop .awning { bottom: calc(var(--px) * 24); left: calc(var(--px) * 2); width: calc(var(--px) * 48); height: calc(var(--px) * 10); background: repeating-linear-gradient(90deg, #d82800 0 calc(var(--px) * 6), #fcfcfc calc(var(--px) * 6) calc(var(--px) * 12)); box-shadow: inset 0 calc(var(--px) * -3) 0 rgba(0, 0, 0, 0.22); }
  .b-shop .awning::after { content: ''; position: absolute; left: 0; bottom: calc(var(--px) * -2); width: 100%; height: calc(var(--px) * 2); background: repeating-linear-gradient(90deg, #d82800 0 calc(var(--px) * 3), transparent calc(var(--px) * 3) calc(var(--px) * 6)); }
  .b-shop .board { bottom: calc(var(--px) * 8); left: calc(var(--px) * 32); width: calc(var(--px) * 10); height: calc(var(--px) * 8); background: #b87818; box-shadow: inset 0 0 0 calc(var(--px) * 2) #7a4810, inset calc(var(--px) * 3) calc(var(--px) * 3) 0 0 #fcd800, 0 0 0 calc(var(--px) * 1) #4a2c08; }
  .b-shop .door { bottom: 0; left: calc(var(--px) * 18); width: calc(var(--px) * 12); height: calc(var(--px) * 16); background: #6a3410; box-shadow: inset 0 0 0 calc(var(--px) * 2) #4a2208, inset calc(var(--px) * -4) 0 0 #7c421a; }
  .b-shop .win { bottom: calc(var(--px) * 8); left: calc(var(--px) * 8); width: calc(var(--px) * 10); height: calc(var(--px) * 10); background: #5c94fc; box-shadow: inset 0 0 0 calc(var(--px) * 2) #c0a070, inset calc(var(--px) * 4) 0 0 #3868c0, inset 0 calc(var(--px) * 4) 0 #3868c0; }

  /* Library — greek temple: pediment, fluted columns, steps */
  .b-library { height: calc(var(--px) * 52); }
  .b-library .pediment { bottom: calc(var(--px) * 30); left: calc(var(--px) * 2); width: 0; height: 0; border-left: calc(var(--px) * 24) solid transparent; border-right: calc(var(--px) * 24) solid transparent; border-bottom: calc(var(--px) * 14) solid #d0c4a0; }
  .b-library .cols { bottom: calc(var(--px) * 6); left: calc(var(--px) * 6); width: calc(var(--px) * 40); height: calc(var(--px) * 24); background: repeating-linear-gradient(90deg, #e8e0c8 0 calc(var(--px) * 6), #b8a888 calc(var(--px) * 6) calc(var(--px) * 8)); box-shadow: inset 0 calc(var(--px) * 4) 0 #c4b890, inset 0 calc(var(--px) * -4) 0 #cfc4a4; }
  .b-library .steps { bottom: 0; left: calc(var(--px) * 2); width: calc(var(--px) * 48); height: calc(var(--px) * 6); background: #d8d0b8; box-shadow: inset 0 0 0 calc(var(--px) * 2) #b8b098, inset 0 calc(var(--px) * 3) 0 #ece4cc; }
  .b-library .gate { bottom: calc(var(--px) * 6); left: calc(var(--px) * 20); width: calc(var(--px) * 12); height: calc(var(--px) * 18); background: #5a3c20; box-shadow: inset 0 0 0 calc(var(--px) * 2) #3a2410; }
  .b-library .gate::after { content: ''; position: absolute; left: calc(var(--px) * 2); top: calc(var(--px) * 2); right: calc(var(--px) * 2); bottom: calc(var(--px) * 2); background: repeating-linear-gradient(90deg, #d82800 0 calc(var(--px) * 2), #b87818 calc(var(--px) * 2) calc(var(--px) * 4), #2038c8 calc(var(--px) * 4) calc(var(--px) * 5)); box-shadow: inset 0 calc(var(--px) * 8) 0 calc(var(--px) * -7) #3a2410; }

  /* Mailbox — post + rounded blue box, slot, raised flag */
  .b-mailbox { width: calc(var(--px) * 36); height: calc(var(--px) * 44); }
  .b-mailbox .post { bottom: 0; left: calc(var(--px) * 14); width: calc(var(--px) * 8); height: calc(var(--px) * 22); background: #6a3b10; box-shadow: inset 0 0 0 calc(var(--px) * 2) #4a2608; }
  .b-mailbox .box { bottom: calc(var(--px) * 20); left: calc(var(--px) * 4); width: calc(var(--px) * 28); height: calc(var(--px) * 16); background: #2038c8; box-shadow: inset 0 0 0 calc(var(--px) * 2) #16205c, inset 0 calc(var(--px) * 6) 0 #3858e0; }
  .b-mailbox .box::after { content: ''; position: absolute; left: calc(var(--px) * 4); top: calc(var(--px) * 4); width: calc(var(--px) * 13); height: calc(var(--px) * 9); box-shadow: inset 0 0 0 calc(var(--px) * 1) #16205c; }
  .b-mailbox .slot { bottom: calc(var(--px) * 30); left: calc(var(--px) * 10); width: calc(var(--px) * 16); height: calc(var(--px) * 3); background: #11185c; }
  .b-mailbox .mflag { bottom: calc(var(--px) * 28); left: calc(var(--px) * 28); width: calc(var(--px) * 8); height: calc(var(--px) * 8); background: #d82800; box-shadow: inset 0 0 0 calc(var(--px) * 2) #8a1800, inset calc(var(--px) * 2) calc(var(--px) * 2) 0 0 #fc6850; }

  /* Chest — gold-banded treasure chest with lock */
  .b-chest { width: calc(var(--px) * 44); height: calc(var(--px) * 32); }
  .b-chest .base { bottom: 0; left: calc(var(--px) * 4); width: calc(var(--px) * 36); height: calc(var(--px) * 14); background: #8a4b1a; box-shadow: inset 0 0 0 calc(var(--px) * 2) #5a2f10, inset 0 calc(var(--px) * -4) 0 #6a3812; }
  .b-chest .base::after { content: ''; position: absolute; left: calc(var(--px) * 3); top: calc(var(--px) * 3); width: calc(var(--px) * 2); height: calc(var(--px) * 2); background: #e0b040; box-shadow: calc(var(--px) * 29) 0 #e0b040, 0 calc(var(--px) * 7) #e0b040, calc(var(--px) * 29) calc(var(--px) * 7) #e0b040; }
  .b-chest .lid { bottom: calc(var(--px) * 14); left: calc(var(--px) * 4); width: calc(var(--px) * 36); height: calc(var(--px) * 10); background: #a85a20; box-shadow: inset 0 calc(var(--px) * -1) 0 #e0b040, inset 0 0 0 calc(var(--px) * 2) #5a2f10, inset 0 calc(var(--px) * 4) 0 #c87838; }
  .b-chest .bands { bottom: 0; left: calc(var(--px) * 4); width: calc(var(--px) * 36); height: calc(var(--px) * 24); background: repeating-linear-gradient(90deg, transparent 0 calc(var(--px) * 14), #e0b040 calc(var(--px) * 14) calc(var(--px) * 18), transparent calc(var(--px) * 18) calc(var(--px) * 32)); }
  .b-chest .lock { bottom: calc(var(--px) * 8); left: 50%; transform: translateX(-50%); width: calc(var(--px) * 8); height: calc(var(--px) * 10); background: #fcd800; box-shadow: inset 0 0 0 calc(var(--px) * 2) #b89000, inset 0 calc(var(--px) * -3) 0 #8a6800; }
  .b-chest.sparkle { animation: sparkle 0.8s steps(2, end) infinite; }
  @keyframes sparkle { 0%, 100% { filter: brightness(1); } 50% { filter: brightness(1.6); } }
  @media (prefers-reduced-motion: reduce) { .b-chest.sparkle, .b-shrine.sparkle { animation: none; } }

  /* Shrine — secret zone: a glowing standing stone with a magic orb */
  .b-shrine { width: calc(var(--px) * 32); height: calc(var(--px) * 52); }
  .b-shrine .base { bottom: 0; left: calc(var(--px) * 6); width: calc(var(--px) * 20); height: calc(var(--px) * 8); background: #6c7280; box-shadow: inset 0 calc(var(--px) * -1) 0 #3a3e46, inset 0 0 0 calc(var(--px) * 2) #4a4e58, inset 0 calc(var(--px) * 3) 0 #8a909c; }
  .b-shrine .pillar { bottom: calc(var(--px) * 8); left: calc(var(--px) * 10); width: calc(var(--px) * 12); height: calc(var(--px) * 28); background: #9aa0ac; box-shadow: inset 0 0 0 calc(var(--px) * 2) #6c7280, inset calc(var(--px) * -3) 0 0 #80868f; }
  .b-shrine .orb { bottom: calc(var(--px) * 32); left: 50%; transform: translateX(-50%); width: calc(var(--px) * 12); height: calc(var(--px) * 12); background: #5cf0a0; box-shadow: 0 0 0 calc(var(--px) * 2) #2bd87a, 0 0 calc(var(--px) * 8) calc(var(--px) * 2) rgba(92, 240, 160, 0.7); animation: orbPulse 1.1s steps(2, end) infinite; }
  @keyframes orbPulse { 0%, 100% { filter: brightness(1); } 50% { filter: brightness(1.7); } }
  .b-shrine.sparkle { animation: sparkle 0.8s steps(2, end) infinite; }
  @media (prefers-reduced-motion: reduce) { .b-shrine .orb { animation: none; } }

  /* ── Hero sprite (original CSS pixel art, ~12×20 sub-pixels) ──────────── */
  .hero {
    --px: calc(var(--tile) / 16);
    position: absolute;
    width: var(--tile);
    height: var(--tile);
    z-index: 6;
    transform: translate(var(--hx), var(--hy));
    transition: transform var(--step) linear;
  }
  @media (prefers-reduced-motion: reduce) { .hero { transition: none; } }
  /* Bump: a short nudge toward the wall and back (transform includes --hx/--hy
     so the hero's map position is preserved during the animation). */
  .hero.bump { animation: none; }
  .hero.bump-up { animation: bumpUp 0.18s steps(2, end); }
  .hero.bump-down { animation: bumpDown 0.18s steps(2, end); }
  .hero.bump-left { animation: bumpLeft 0.18s steps(2, end); }
  .hero.bump-right { animation: bumpRight 0.18s steps(2, end); }
  @keyframes bumpUp { 50% { transform: translate(var(--hx), calc(var(--hy) - var(--px) * 4)); } }
  @keyframes bumpDown { 50% { transform: translate(var(--hx), calc(var(--hy) + var(--px) * 4)); } }
  @keyframes bumpLeft { 50% { transform: translate(calc(var(--hx) - var(--px) * 4), var(--hy)); } }
  @keyframes bumpRight { 50% { transform: translate(calc(var(--hx) + var(--px) * 4), var(--hy)); } }
  @media (prefers-reduced-motion: reduce) {
    .hero.bump-up, .hero.bump-down, .hero.bump-left, .hero.bump-right { animation: none; }
  }
  /* Idle "Zzz" floating above the hero */
  .zzz {
    position: absolute;
    bottom: calc(100% - var(--px) * 4);
    left: 64%;
    color: #fcfcfc;
    font-size: 0.5rem;
    text-shadow: 1px 1px 0 #1c1c2e;
    z-index: 9;
    animation: floatZ 1.6s steps(4, end) infinite;
  }
  @keyframes floatZ {
    0% { opacity: 0; transform: translateY(0) scale(0.6); }
    40% { opacity: 1; }
    100% { opacity: 0; transform: translateY(calc(var(--px) * -12)) scale(1.1); }
  }
  @media (prefers-reduced-motion: reduce) { .zzz { display: none; } }
  /* Fishing prompt bubble when facing water */
  .fish-hint {
    position: absolute;
    bottom: calc(100% + var(--px) * 2);
    left: 50%;
    transform: translateX(-50%);
    white-space: nowrap;
    background: #1c1c2e;
    border: 2px solid #fcd800;
    color: #fcd800;
    font-size: 0.66rem;
    padding: 5px 8px;
    z-index: 9;
  }

  /* Collectible coin — a little spinning gold disc */
  .coin {
    --px: calc(var(--tile) / 16);
    position: absolute;
    width: calc(var(--tile) * 2);
    height: calc(var(--tile) * 2);
    z-index: 4;
    pointer-events: none;
  }
  .coin::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: calc(var(--px) * 12);
    height: calc(var(--px) * 16);
    background: #fcd800;
    box-shadow: inset 0 calc(var(--px) * 1) 0 #fff8b0, inset calc(var(--px) * -3) 0 0 #c89000, inset calc(var(--px) * 4) 0 0 #ffe840;
    animation: coinSpin 1.1s steps(4, end) infinite;
  }
  @keyframes coinSpin {
    0%, 100% { transform: translate(-50%, -50%) scaleX(1); }
    25% { transform: translate(-50%, -50%) scaleX(0.3); }
    50% { transform: translate(-50%, -50%) scaleX(0.08); }
    75% { transform: translate(-50%, -50%) scaleX(0.3); }
  }
  @media (prefers-reduced-motion: reduce) { .coin::after { animation: none; } }
  .hero-shadow {
    position: absolute;
    bottom: calc(var(--px) * 3);
    left: 50%;
    transform: translateX(-50%);
    width: calc(var(--px) * 22);
    height: calc(var(--px) * 4);
    background: rgba(0, 0, 0, 0.32);
  }
  .hero-sprite {
    position: absolute;
    left: 50%;
    bottom: calc(var(--px) * 4);
    transform: translateX(-50%);
    width: calc(var(--px) * 24);
    height: calc(var(--px) * 40);
  }
  .hero-sprite.flip { transform: translateX(-50%) scaleX(-1); }
  .hero-sprite > span { position: absolute; image-rendering: pixelated; }

  /* Hair (blond, short & messy), fringe, face, eyes */
  .h-hat-top { top: 0; left: calc(var(--px) * 5); width: calc(var(--px) * 14); height: calc(var(--px) * 5); background: #e6bd4d; box-shadow: inset 0 calc(var(--px) * 2) 0 #f3d77f, calc(var(--px) * -3) 0 0 #e6bd4d, calc(var(--px) * 3) calc(var(--px) * -2) 0 #f3d77f; }
  .h-hat-brim { top: calc(var(--px) * 5); left: calc(var(--px) * 3); width: calc(var(--px) * 18); height: calc(var(--px) * 3); background: #c9962f; box-shadow: inset 0 calc(var(--px) * -1) 0 #a67a20, inset 0 calc(var(--px) * 1) 0 #e6bd4d; }
  .h-face { top: calc(var(--px) * 8); left: calc(var(--px) * 6); width: calc(var(--px) * 12); height: calc(var(--px) * 8); background: #fcb878; box-shadow: inset 0 0 0 calc(var(--px) * 2) #e09850; }
  .h-eye { top: calc(var(--px) * 11); width: calc(var(--px) * 2); height: calc(var(--px) * 3); background: #20123a; box-shadow: inset 0 calc(var(--px) * 1) 0 #6c5c9c; }
  .h-eye.l { left: calc(var(--px) * 8); }
  .h-eye.r { right: calc(var(--px) * 8); }
  /* Tunic, belt, arms, legs */
  .h-body { top: calc(var(--px) * 16); left: calc(var(--px) * 5); width: calc(var(--px) * 14); height: calc(var(--px) * 12); background: #d82800; box-shadow: inset 0 0 0 calc(var(--px) * 2) #a01800, inset 0 calc(var(--px) * 3) 0 #fc4030; }
  .h-body-shade { top: calc(var(--px) * 18); left: calc(var(--px) * 15); width: calc(var(--px) * 3); height: calc(var(--px) * 9); background: #a01800; }
  .h-belt { top: calc(var(--px) * 24); left: calc(var(--px) * 5); width: calc(var(--px) * 14); height: calc(var(--px) * 3); background: #7a3b10; box-shadow: inset 0 0 0 1px #4a2208; }
  .h-buckle { top: calc(var(--px) * 24); left: calc(var(--px) * 11); width: calc(var(--px) * 3); height: calc(var(--px) * 3); background: #fcd800; box-shadow: inset 0 0 0 calc(var(--px) * 1) #b89000; }
  .h-arm { top: calc(var(--px) * 17); width: calc(var(--px) * 4); height: calc(var(--px) * 8); background: #b81f00; box-shadow: inset 0 calc(var(--px) * -3) 0 #fcb878; }
  .h-arm.l { left: calc(var(--px) * 1); }
  .h-arm.r { right: calc(var(--px) * 1); }
  .h-leg { top: calc(var(--px) * 27); width: calc(var(--px) * 6); height: calc(var(--px) * 10); background: #2038a0; box-shadow: inset 0 calc(var(--px) * -4) 0 #3a2410; }
  .h-leg.l { left: calc(var(--px) * 6); }
  .h-leg.r { right: calc(var(--px) * 6); }
  .h-boot { top: calc(var(--px) * 35); width: calc(var(--px) * 6); height: calc(var(--px) * 2); background: #241606; }
  .h-boot.l { left: calc(var(--px) * 6); }
  .h-boot.r { right: calc(var(--px) * 6); }
  /* Walk frame: legs & arms swing in opposition + a tiny body bob */
  .hero-sprite.step .h-leg.l, .hero-sprite.step .h-boot.l { transform: translateY(calc(var(--px) * -2)); }
  .hero-sprite.step .h-leg.r, .hero-sprite.step .h-boot.r { transform: translateY(calc(var(--px) * 1)); }
  .hero-sprite.step .h-arm.l { transform: translateY(calc(var(--px) * 1.6)); }
  .hero-sprite.step .h-arm.r { transform: translateY(calc(var(--px) * -1.6)); }
  /* Facing up: back of head (blond hair, no eyes), arms tuck in */
  .facing-up .h-face { background: #d9a93f; box-shadow: inset 0 0 0 calc(var(--px) * 2) #c9962f; }
  .facing-up .h-eye { opacity: 0; }
  .facing-up .h-buckle { opacity: 0; }
  /* Facing right (left = mirrored via .flip): single eye toward the front */
  .facing-right .h-eye.l { opacity: 0; }
  .facing-right .h-eye.r { right: calc(var(--px) * 5); }
  .facing-right .h-arm.l { opacity: 0; }
  .facing-right .h-arm.r { right: calc(var(--px) * 3); }

  /* ── Controls hint ───────────────────────────────────────────────────── */
  .controls-hint {
    position: absolute;
    top: 64px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 55;
    background: #1c1c2e;
    border: 2px solid #fcd800;
    color: #fcd800;
    font-size: 0.64rem;
    line-height: 1.7;
    padding: 9px 12px;
    max-width: 88vw;
    text-align: center;
    animation: blinkSoft 1.2s steps(2, end) infinite;
  }
  @keyframes blinkSoft { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
  @media (prefers-reduced-motion: reduce) { .controls-hint { animation: none; } }

  /* ── Touch D-pad ─────────────────────────────────────────────────────── */
  .dpad {
    position: absolute;
    left: 16px;
    bottom: 96px;
    z-index: 58;
    display: grid;
    grid-template-columns: repeat(3, 44px);
    grid-template-rows: repeat(3, 44px);
    gap: 2px;
  }
  .dpad .d {
    background: #1c1c2e;
    border: 3px solid #fcfcfc;
    color: #fcfcfc;
    box-shadow: 2px 2px 0 #000;
    font-family: inherit;
    font-size: 0.7rem;
    cursor: pointer;
    touch-action: none;
    user-select: none;
  }
  .dpad .d:active { background: #d82800; transform: translate(1px, 1px); box-shadow: 1px 1px 0 #000; }
  .dpad .up { grid-area: 1 / 2; }
  .dpad .left { grid-area: 2 / 1; }
  .dpad .right { grid-area: 2 / 3; }
  .dpad .down { grid-area: 3 / 2; }

  /* ── A / B action buttons (Game Boy style, right side) ───────────────── */
  .ab-pad {
    position: absolute;
    right: 16px;
    bottom: 96px;
    z-index: 85; /* above the dialog .overlay (70) so A/B can drive the text */
    display: grid;
    grid-template-columns: repeat(2, 52px);
    grid-template-rows: repeat(2, 52px);
    gap: 4px;
  }
  .ab-pad .ab {
    border-radius: 50%;
    border: 3px solid #fcfcfc;
    background: #d82800;
    color: #fcfcfc;
    box-shadow: 2px 2px 0 #000;
    font-family: inherit;
    font-size: 0.8rem;
    line-height: 1;
    cursor: pointer;
    touch-action: none;
    user-select: none;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .ab-pad .ab:active { background: #1c1c2e; transform: translate(1px, 1px); box-shadow: 1px 1px 0 #000; }
  .ab-pad .a { grid-area: 1 / 2; } /* A: upper-right */
  .ab-pad .b { grid-area: 2 / 1; } /* B: lower-left  */

  /* Mouse/desktop users have the keyboard; hide the touch controls unless touch. */
  @media (hover: hover) and (pointer: fine) { .dpad, .ab-pad { display: none; } }

  /* ── Static reduced-motion village ───────────────────────────────────── */
  .static-village { position: absolute; inset: 0; padding: 80px 20px 110px; overflow-y: auto; box-sizing: border-box; }
  .village-lead { font-size: 0.62rem; line-height: 1.6; color: #fcd800; text-align: center; margin: 0 auto 22px; max-width: 640px; }
  .zone-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; max-width: 760px; margin: 0 auto; }
  .zone-card {
    background: #2a2a44;
    border: 3px solid #fcfcfc;
    box-shadow: 4px 4px 0 #000;
    color: #fcfcfc;
    font-family: inherit;
    text-align: left;
    padding: 14px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .zone-card:hover { background: #2b39ff; }
  .zone-card:active { transform: translate(2px, 2px); box-shadow: 2px 2px 0 #000; }
  .zc-name { font-size: 0.72rem; color: #fcd800; }
  .zc-sub { font-size: 0.52rem; line-height: 1.5; }
  .zc-done { font-size: 0.46rem; color: #00e070; }

  /* ── Overlays / NES panels ───────────────────────────────────────────── */
  .overlay { position: absolute; inset: 0; z-index: 70; display: flex; align-items: center; justify-content: center; padding: 18px; box-sizing: border-box; }
  .backdrop { position: absolute; inset: 0; background: rgba(8, 8, 20, 0.72); border: none; padding: 0; cursor: pointer; }
  .nes-panel {
    position: relative;
    z-index: 1;
    width: min(680px, 94vw);
    max-height: min(78vh, 620px);
    background: #1c1c2e;
    border: 4px solid #fcfcfc;
    box-shadow: 6px 6px 0 #000, inset 0 0 0 3px #2b39ff;
    display: flex;
    flex-direction: column;
    margin-bottom: 56px; /* keep clear of the bottom Timeline */
  }
  .panel-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    background: #2b39ff;
    color: #fcfcfc;
    font-size: 0.6rem;
    padding: 10px 12px;
    border-bottom: 3px solid #fcfcfc;
  }
  .panel-bar .x { background: #d82800; border: 2px solid #fcfcfc; color: #fcfcfc; font-family: inherit; font-size: 0.55rem; cursor: pointer; padding: 4px 7px; }
  .panel-bar .x:hover { background: #fc4030; }
  .panel-body { padding: 16px; overflow-y: auto; line-height: 1.7; }
  .panel-body::-webkit-scrollbar { width: 10px; }
  .panel-body::-webkit-scrollbar-thumb { background: #2b39ff; border: 2px solid #1c1c2e; }

  .intro { font-size: 0.62rem; color: #fcd800; line-height: 1.7; margin: 0 0 14px; }
  .caret { animation: blinkSoft 0.9s steps(2, end) infinite; }
  @media (prefers-reduced-motion: reduce) { .caret { animation: none; } }

  .role { font-size: 0.58rem; color: #5cf0a0; margin: 0 0 10px; }
  .tagline { font-size: 0.58rem; color: #9db8ff; line-height: 1.7; margin: 0 0 12px; }
  .summary { font-size: 0.6rem; line-height: 1.9; margin: 0 0 8px; }

  .rooms { display: flex; flex-direction: column; gap: 14px; }
  .room { border: 3px solid #2b39ff; padding: 12px; background: #20203a; }
  .room-head { display: flex; justify-content: space-between; gap: 10px; margin-bottom: 8px; }
  .floor { font-size: 0.5rem; color: #fcd800; }
  .period { font-size: 0.54rem; color: #9db8ff; }
  .job-title { font-size: 0.6rem; color: #fcfcfc; margin: 0 0 6px; line-height: 1.6; }
  .job-co { font-size: 0.56rem; color: #5cf0a0; margin: 0 0 8px; line-height: 1.6; }
  .job-desc { font-size: 0.58rem; line-height: 1.9; margin: 0 0 8px; }
  .hl { margin: 0 0 8px; padding-left: 16px; }
  .hl li { font-size: 0.56rem; line-height: 2; margin-bottom: 4px; }

  .tags { display: flex; flex-wrap: wrap; gap: 6px; }
  .tag { font-size: 0.52rem; background: #1c1c2e; border: 2px solid #fcfcfc; padding: 4px 6px; line-height: 1.4; }
  .tag.powerup { border-color: #fcd800; color: #fcd800; }

  .bags { display: flex; flex-direction: column; gap: 14px; }
  .bag-label { font-size: 0.56rem; color: #fcd800; margin: 14px 0 8px; }
  .bag-label:first-child { margin-top: 0; }
  .book { border-left: 4px solid #2b39ff; padding-left: 10px; margin-bottom: 10px; }

  .links { display: flex; flex-direction: column; gap: 10px; }
  .link { font-size: 0.56rem; color: #9db8ff; text-decoration: none; border: 2px solid #2b39ff; padding: 10px; line-height: 1.6; word-break: break-word; }
  .link:hover { background: #2b39ff; color: #fcfcfc; }

  .quest-note { font-size: 0.54rem; color: #fcd800; line-height: 1.7; margin: 12px 0; }
  .cv-btn {
    margin-top: 12px;
    background: #fcd800;
    border: 3px solid #fcfcfc;
    box-shadow: 4px 4px 0 #000;
    color: #1c1c2e;
    font-family: inherit;
    font-size: 0.6rem;
    padding: 14px 18px;
    cursor: pointer;
  }
  .cv-btn:hover { background: #ffe840; }
  .cv-btn:active { transform: translate(2px, 2px); box-shadow: 2px 2px 0 #000; }

  .directory .panel-body { padding: 18px; }

  /* ── Quest banner ────────────────────────────────────────────────────── */
  .quest-banner {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 80;
    background: #1c1c2e;
    border: 4px solid #fcd800;
    box-shadow: 6px 6px 0 #000;
    padding: 22px 30px;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 10px;
    animation: pop 0.3s steps(3, end);
  }
  .quest-banner span { font-size: 0.9rem; color: #fcd800; }
  .quest-banner small { font-size: 0.5rem; color: #fcfcfc; line-height: 1.6; }
  @keyframes pop { 0% { transform: translate(-50%, -50%) scale(0.6); } 100% { transform: translate(-50%, -50%) scale(1); } }
  @media (prefers-reduced-motion: reduce) { .quest-banner { animation: none; } }

  /* ── Night mode (Konami) ─────────────────────────────────────────────── */
  .night-overlay {
    position: absolute;
    inset: 0;
    z-index: 50;
    pointer-events: none;
    background: rgba(16, 18, 64, 0.55);
    mix-blend-mode: multiply;
    box-shadow:
      120px 90px 0 rgba(252, 252, 252, 0.9),
      340px 60px 0 rgba(252, 252, 252, 0.7),
      560px 140px 0 rgba(252, 252, 252, 0.85),
      780px 70px 0 rgba(252, 252, 252, 0.6),
      980px 120px 0 rgba(252, 252, 252, 0.8),
      220px 200px 0 rgba(252, 252, 252, 0.6),
      660px 220px 0 rgba(252, 252, 252, 0.7);
  }

  /* ── Fishing toast ───────────────────────────────────────────────────── */
  .fish-toast {
    position: absolute;
    bottom: 120px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 65;
    background: #1c1c2e;
    border: 3px solid #5c94fc;
    box-shadow: 4px 4px 0 #000;
    color: #fcfcfc;
    font-size: 0.68rem;
    line-height: 1.8;
    padding: 14px 18px;
    text-align: center;
    max-width: 88vw;
  }

  /* ── Easter-egg toasts (Konami / secret unlock) ──────────────────────── */
  .egg-toast {
    position: absolute;
    top: 96px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 82;
    background: #1c1c2e;
    border: 4px solid #fcd800;
    box-shadow: 5px 5px 0 #000;
    padding: 14px 20px;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-width: 92vw;
    animation: pop 0.3s steps(3, end);
  }
  .egg-toast.secret { border-color: #5cf0a0; }
  .egg-toast span { font-size: 0.76rem; color: #fcd800; }
  .egg-toast.secret span { color: #5cf0a0; }
  .egg-toast small { font-size: 0.62rem; color: #fcfcfc; line-height: 1.7; }
  @media (prefers-reduced-motion: reduce) { .egg-toast { animation: none; } }

  /* ── Secret zone "hero stat sheet" ───────────────────────────────────── */
  .stats { display: flex; flex-direction: column; gap: 8px; margin: 4px 0 14px; }
  .stat { display: flex; justify-content: space-between; gap: 12px; border-bottom: 2px dotted #2b39ff; padding-bottom: 6px; }
  .stat-label { font-size: 0.56rem; color: #9db8ff; line-height: 1.6; }
  .stat-value { font-size: 0.56rem; color: #fcd800; text-align: right; line-height: 1.6; }

  @media (max-width: 600px) {
    .hud { padding: 8px; flex-direction: column; gap: 8px; }
    .hud-box { font-size: 0.5rem; }
    .panel-bar { font-size: 0.5rem; }
    .nes-panel { margin-bottom: 64px; }
    /* The HUD stacks into a taller column here; drop the hint box clear of it. */
    .controls-hint { top: 124px; }
  }
</style>
