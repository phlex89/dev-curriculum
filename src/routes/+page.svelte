<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { currentTheme, ERA_ORDER, type Theme } from '$lib/store';
  import { initAudio, playEra, toggleAudio, audioEnabled } from '$lib/audio';
  import { trackEra, trackEvent } from '$lib/analytics';
  import Timeline from '$lib/components/Timeline.svelte';
  import EraVote from '$lib/components/EraVote.svelte';
  import SeoContent from '$lib/components/SeoContent.svelte';
  import { themeLoaders, prefetchTheme } from '$lib/themes/registry';

  const eraLabels: Record<string, string> = {
    terminal: 'Terminale · 1980s',
    teletext: 'Televideo · 1984',
    pixel: 'Pixel Art · 1988',
    web1: 'Web 1.0 · 1996',
    winxp: 'Windows XP · 2001',
    skeuo: 'Skeuomorphism · 2010',
    material: 'Material Design · 2014',
    bento: 'Modern Flat · 2015',
    brutalism: 'Brutalism · 2017',
    parallax: 'Parallax · 2018',
    glass: 'Glassmorphism · 2020',
    threed: 'Future 3D · 2026'
  };

  const prefersReduced = () =>
    typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Gate the first paint: until the real era is resolved from the URL/localStorage
  // we render nothing, so the visitor never sees the default (bento) flash and the
  // cross-dissolve/time-travel FX don't fire on load — just a clean fade-in.
  let booted = $state(false);

  // Before boot (and in the prerendered HTML) the store still holds the default
  // era, so serve a neutral era-agnostic title; the per-era title takes over
  // after hydration resolves the real era.
  const pageTitle = $derived(
    booted
      ? `Stefano Tedeschi — CV · ${eraLabels[$currentTheme] ?? 'Time-Machine Resume'}`
      : 'Stefano Tedeschi — Frontend Architect · CV interattivo'
  );

  // The era actually on screen. It LAGS `$currentTheme`: when a new era is picked
  // we keep the current one rendered until its (code-split) chunk has loaded, then
  // swap. So the cross-fade always animates between two *real* layers — the
  // visitor never sees an empty layer fade in while the chunk downloads. The
  // Timeline pill follows `$currentTheme` immediately, so the click still feels live.
  let displayedTheme = $state<Theme | null>(null);
  let loadingTheme = $state<Theme | null>(null); // chunk in flight, for the loading cue

  // Directional time-travel transition: glitch going back, bloom going forward.
  let fxClass = $state<'fx-back' | 'fx-forward' | null>(null);
  let fxKey = $state(0);
  let prevIdx = -1;

  // Load the selected era's chunk, THEN reveal it. Watching the store covers every
  // entry point: Timeline click, keyboard nav, deep-link/back-forward hashchange.
  $effect(() => {
    const target = $currentTheme;
    if (!booted || target === displayedTheme) {
      loadingTheme = null;
      return;
    }
    loadingTheme = target;
    let cancelled = false;
    themeLoaders[target]()
      .then(() => {
        if (cancelled || $currentTheme !== target) return; // a newer selection won the race
        displayedTheme = target;
        loadingTheme = null;
      })
      .catch(() => {
        // Chunk failed to load: drop the cue and let the current era stay put.
        if (!cancelled) loadingTheme = null;
      });
    return () => {
      cancelled = true;
    };
  });

  // Fire the time-travel FX + era audio on the real swap (displayedTheme), so the
  // overlay masks the cross-fade rather than playing over a still-loading layer.
  $effect(() => {
    const dt = displayedTheme;
    if (!booted || dt === null) return;
    const idx = ERA_ORDER.indexOf(dt);
    if (idx === prevIdx) return;
    const dir = idx > prevIdx ? 'fx-forward' : 'fx-back';
    prevIdx = idx;

    playEra(dt); // no-op unless the visitor opted into audio

    if (!prefersReduced()) {
      fxClass = dir;
      fxKey++; // re-mount the overlay so its animation replays
    }
  });

  // Tag the Clarity session with each era actually shown (covers the initial era
  // at boot and every swap: Timeline click, keyboard nav, hashchange/back-forward).
  $effect(() => {
    const dt = displayedTheme;
    if (!booted || dt === null) return;
    trackEra(dt);
  });

  function onAudioToggle() {
    const on = toggleAudio();
    if (on) {
      trackEvent('audio-on');
      playEra($currentTheme); // confirm with the current era's cue
    }
  }

  onMount(() => {
    currentTheme.init(); // resolves the real era synchronously (URL hash / saved pref)
    initAudio();

    // Sync prevIdx + displayedTheme to the resolved era so unlocking `booted` doesn't
    // read as a navigation — then reveal, letting the theme layer fade in for the first time.
    displayedTheme = $currentTheme;
    prevIdx = ERA_ORDER.indexOf($currentTheme);
    booted = true;

    // Warm the neighbouring eras' chunks so left/right time-travel feels instant.
    const warmNeighbours = () => {
      if (ERA_ORDER[prevIdx - 1]) prefetchTheme(ERA_ORDER[prevIdx - 1]);
      if (ERA_ORDER[prevIdx + 1]) prefetchTheme(ERA_ORDER[prevIdx + 1]);
    };
    if ('requestIdleCallback' in window) requestIdleCallback(warmNeighbours);
    else setTimeout(warmNeighbours, 600);

    // Keep the active era in sync with the URL (deep-links, back/forward navigation).
    const onHash = () => {
      const t = location.hash.slice(1);
      if ((['terminal', 'teletext', 'pixel', 'web1', 'winxp', 'skeuo', 'material', 'brutalism', 'bento', 'parallax', 'glass', 'threed'] as const).includes(t as Theme)) {
        currentTheme.setFromHash(t as Theme);
      }
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  });
</script>

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

<main class="app-container">
  <!-- Canonical, prerendered CV (single source of truth: cv-data.ts). Always
       mounted and visually hidden (.sr-only): present in the static HTML for
       crawlers and screen readers, while the eras render the visible UI. -->
  <div class="sr-only">
    <SeoContent />
  </div>

  <!-- Thin top bar while a not-yet-cached era chunk is loading. The CSS fade-in
       delay means it only ever shows for genuinely slow (uncached) navigations;
       prefetched eras swap before it would appear. -->
  {#if loadingTheme}
    <div class="load-bar" aria-hidden="true"></div>
  {/if}

  {#if booted && displayedTheme}
    {#key displayedTheme}
      <div class="theme-layer" in:fade={{ duration: 600, delay: 260 }} out:fade={{ duration: 460 }}>
        {#await themeLoaders[displayedTheme]() then mod}
          {@const ThemeComponent = mod.default}
          <ThemeComponent />
        {/await}
      </div>
    {/key}
  {/if}

  {#if fxClass}
    {#key fxKey}
      <div class="fx-overlay {fxClass}" onanimationend={() => (fxClass = null)}></div>
    {/key}
  {/if}

  <!-- Global opt-in era-audio toggle (floats bottom-left, themed per era) -->
  <button
    class="audio-fab theme-{$currentTheme}"
    class:on={$audioEnabled}
    onclick={onAudioToggle}
    aria-pressed={$audioEnabled}
    aria-label={$audioEnabled ? 'Disattiva i suoni d’epoca' : 'Attiva i suoni d’epoca'}
    title={$audioEnabled ? 'Suoni: attivi' : 'Suoni: muto'}
  >
    <span class="audio-icon">{$audioEnabled ? '🔊' : '🔇'}</span>
  </button>

  <!-- Soft bottom scrim: lifts the Timeline off the background so it stays legible
       even on the light-on-light eras (Material, Bento, Glass, Web 1.0). -->
  <div class="timeline-scrim theme-{$currentTheme}" aria-hidden="true"></div>

  <Timeline />
  <EraVote />
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    overflow: hidden; /* Themes handle their own scrolling if needed */
    background: #000;
  }

  .app-container {
    width: 100vw;
    height: 100vh;
    height: 100dvh; /* mobile: account for browser chrome so the Timeline stays reachable */
    position: relative;
  }

  /* Visually-hidden but crawlable/announced: the canonical CV ships in the
     prerendered HTML for search engines and screen readers without affecting the
     era overlay on screen. Standard sr-only clip technique (not display:none, so
     it stays in the accessibility tree and the indexed markup). */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* Each theme fades in/out over the other for a smooth cross-dissolve */
  .theme-layer {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  /* --- Loading bar: only surfaces when a chunk load is genuinely slow --- */
  .load-bar {
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    width: 100%;
    z-index: 9995; /* above themes, below the Timeline (9999) */
    transform-origin: 0 50%;
    background: linear-gradient(90deg, #0071e3, #4f46e5, #7df9ff);
    /* Stay invisible for the first 220ms (covers prefetched/cached swaps), then
       fade in and creep across so a long load reads as progress, not a freeze. */
    opacity: 0;
    animation:
      loadBarFade 0.3s ease 0.22s forwards,
      loadBarCreep 8s cubic-bezier(0.1, 0.7, 0.1, 1) 0.22s forwards;
  }
  @keyframes loadBarFade {
    to { opacity: 1; }
  }
  @keyframes loadBarCreep {
    0% { transform: scaleX(0.02); }
    60% { transform: scaleX(0.7); }
    100% { transform: scaleX(0.95); }
  }
  @media (prefers-reduced-motion: reduce) {
    .load-bar { animation: loadBarFade 0.2s ease 0.22s forwards; transform: scaleX(1); }
  }

  /* --- Directional time-travel FX overlay --- */
  .fx-overlay {
    position: fixed;
    inset: 0;
    z-index: 9990; /* above the themes, below the Timeline (9999) */
    pointer-events: none;
    will-change: opacity, transform, clip-path;
  }

  /* Forward in time → a luminous bloom that flares out and fades. */
  .fx-forward {
    background: radial-gradient(
      circle at 50% 50%,
      rgba(255, 255, 255, 0.95),
      rgba(165, 180, 255, 0.45) 38%,
      rgba(125, 249, 255, 0.12) 60%,
      transparent 74%
    );
    mix-blend-mode: screen;
    animation: bloomFx 680ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
  @keyframes bloomFx {
    0% { opacity: 0; transform: scale(0.35); filter: blur(10px); }
    30% { opacity: 1; }
    100% { opacity: 0; transform: scale(1.7); filter: blur(0); }
  }

  /* Back in time → a CRT scan/glitch wipe with green phosphor scanlines. */
  .fx-back {
    background:
      linear-gradient(180deg, transparent 0%, rgba(120, 255, 170, 0.18) 48%, rgba(120, 255, 170, 0.28) 50%, rgba(120, 255, 170, 0.18) 52%, transparent 100%),
      repeating-linear-gradient(0deg, rgba(0, 255, 120, 0.05) 0 2px, transparent 2px 4px);
    mix-blend-mode: screen;
    animation: glitchFx 520ms steps(8, end) forwards;
  }
  @keyframes glitchFx {
    0% { opacity: 0; background-position: 0 -100%, 0 0; transform: translateX(0); }
    8% { opacity: 1; transform: translateX(-5px); }
    16% { transform: translateX(4px); }
    30% { transform: translateX(-3px); }
    50% { opacity: 1; transform: translateX(2px); }
    70% { transform: translateX(-2px); }
    100% { opacity: 0; background-position: 0 200%, 0 0; transform: translateX(0); }
  }

  @media (prefers-reduced-motion: reduce) {
    .theme-layer { transition: none; }
    .fx-overlay { display: none; }
  }

  /* --- Soft bottom scrim behind the Timeline --- */
  .timeline-scrim {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    height: 160px;
    z-index: 9998; /* under the Timeline (9999), over the theme layer */
    pointer-events: none;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.34) 0%, rgba(0, 0, 0, 0.13) 50%, transparent 100%);
  }
  /* Future 3D is the worst case: the Timeline pill is near-transparent glass over
     a busy luminous scene, so it needs a deeper scrim to read against. */
  .timeline-scrim.theme-threed {
    height: 190px;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.66) 0%, rgba(0, 0, 0, 0.32) 45%, transparent 100%);
  }

  /* --- Global audio toggle (bottom-left, aligned with the Timeline) --- */
  .audio-fab {
    position: fixed;
    bottom: 20px;
    left: 20px;
    z-index: 9999;
    width: 42px;
    height: 42px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.4);
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    color: #333;
    transition: background 0.25s ease, transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275),
      border-color 0.3s ease, box-shadow 0.3s ease, bottom 0.3s ease;
  }
  .audio-fab:hover { transform: translateY(-2px) scale(1.06); }
  .audio-fab:active { transform: scale(0.94); }
  .audio-fab.on { background: rgba(0, 113, 227, 0.16); }
  .audio-fab:focus-visible { outline: 2px solid #0071e3; outline-offset: 3px; }
  .audio-icon { font-size: 1.05rem; line-height: 1; }

  /* Per-theme skins (mirror the Timeline's era styling) */
  .audio-fab.theme-terminal {
    background: #000;
    border: 1px solid #00ff00;
    border-radius: 0;
    color: #00ff00;
    box-shadow: 0 0 10px rgba(0, 255, 0, 0.2);
    backdrop-filter: none;
  }
  .audio-fab.theme-terminal.on { background: #002200; box-shadow: inset 0 0 10px rgba(0, 255, 0, 0.5); }

  .audio-fab.theme-teletext {
    background: #000;
    border: 2px solid #ffff00;
    border-radius: 0;
    color: #ffff00;
    box-shadow: none;
    backdrop-filter: none;
  }
  .audio-fab.theme-teletext.on { background: #0000ff; border-color: #00ffff; color: #fff; }

  .audio-fab.theme-winxp {
    bottom: 40px; /* clear the XP taskbar, like the Timeline does */
    background: #ece9d8;
    border: 2px outset #fff;
    border-radius: 0;
    color: #000;
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
    backdrop-filter: none;
  }
  .audio-fab.theme-winxp.on { background: #0058e6; color: #fff; border-style: inset; }

  .audio-fab.theme-skeuo {
    background: linear-gradient(180deg, #fcfcfd, #c9c9ce);
    border: 1px solid #9a9aa0;
    color: #4a4a50;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9), 0 2px 0 #8d8d92, 0 6px 14px rgba(0, 0, 0, 0.4);
    backdrop-filter: none;
  }
  .audio-fab.theme-skeuo.on {
    background: linear-gradient(180deg, #7fd0ff, #2f8fe0);
    border-color: #1f6fc0;
    color: #fff;
  }

  /* Material: flat white surface, crisp elevation shadow, indigo accent when on. */
  .audio-fab.theme-material {
    background: #fff;
    border: none;
    color: #5c6bc0;
    box-shadow:
      0 3px 5px -1px rgba(0, 0, 0, 0.2),
      0 6px 10px 0 rgba(0, 0, 0, 0.14),
      0 1px 18px 0 rgba(0, 0, 0, 0.12);
    backdrop-filter: none;
  }
  .audio-fab.theme-material.on {
    background: #3f51b5;
    color: #fff;
  }

  .audio-fab.theme-brutalism {
    background: #f3efe2;
    border: 3px solid #0c0c0c;
    border-radius: 0;
    color: #0c0c0c;
    box-shadow: 4px 4px 0 #0c0c0c;
    backdrop-filter: none;
  }
  .audio-fab.theme-brutalism:hover { transform: translate(2px, 2px); box-shadow: 2px 2px 0 #0c0c0c; }
  .audio-fab.theme-brutalism.on { background: #e9ff1a; }

  /* Web 1.0: silver Netscape/Win95 button bevel, no blur. */
  .audio-fab.theme-web1 {
    background: #c0c0c0;
    border: 2px outset #f5f5f5;
    border-radius: 0;
    color: #000080;
    box-shadow: 1px 1px 0 #808080, 2px 2px 4px rgba(0, 0, 0, 0.4);
    backdrop-filter: none;
  }
  .audio-fab.theme-web1:active { border-style: inset; }
  .audio-fab.theme-web1.on { background: #000080; color: #fff; border-style: inset; }

  .audio-fab.theme-threed {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #fff;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  }
  .audio-fab.theme-threed.on {
    background: rgba(0, 255, 255, 0.25);
    border-color: #00ffff;
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
  }

  /* Glassmorphism: frosted milky pill with a fine top light-edge — the luminous
     Big Sur look (light, not the dark neon of threed). */
  .audio-fab.theme-glass {
    background: rgba(255, 255, 255, 0.45);
    border: 1px solid rgba(255, 255, 255, 0.6);
    color: #4338ca;
    -webkit-backdrop-filter: blur(18px) saturate(180%);
    backdrop-filter: blur(18px) saturate(180%);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7), 0 8px 24px rgba(31, 38, 135, 0.18);
  }
  .audio-fab.theme-glass.on {
    background: rgba(124, 116, 255, 0.42);
    border-color: rgba(255, 255, 255, 0.8);
    color: #fff;
  }

  /* Parallax: warm cream pill with an olive accent when active — matches the
     editorial light palette of the era (no neon, no heavy blur). */
  .audio-fab.theme-parallax {
    background: rgba(243, 239, 231, 0.85);
    border: 1px solid rgba(40, 38, 34, 0.16);
    color: #6b6a4b;
    box-shadow: 0 10px 30px rgba(40, 38, 34, 0.12);
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
  }
  .audio-fab.theme-parallax.on {
    background: #6b6a4b;
    border-color: #6b6a4b;
    color: #f3efe7;
  }

  /* Pixel-art: chunky NES dialog-box chrome, hard pixel shadow, no blur. */
  .audio-fab.theme-pixel {
    background: #1c1c2e;
    border: 3px solid #fcfcfc;
    border-radius: 0;
    color: #fcfcfc;
    box-shadow: 3px 3px 0 #000;
    backdrop-filter: none;
    image-rendering: pixelated;
  }
  .audio-fab.theme-pixel:hover { transform: translate(1px, 1px); box-shadow: 2px 2px 0 #000; }
  .audio-fab.theme-pixel.on { background: #d82800; }
  .audio-fab.theme-pixel .audio-icon { font-size: 0.95rem; }

  @media (max-width: 720px) {
    /* The Timeline collapses to a full-width bottom stepper here, so the audio
       toggle moves to the top-right corner to stop the two from overlapping. */
    .audio-fab {
      top: 14px;
      right: 14px;
      left: auto;
      bottom: auto;
      width: 38px;
      height: 38px;
    }

    /* Per-era nudges: each chrome keeps its own top-of-screen furniture, so the
       toggle steps aside to avoid covering it. */
    /* Material: drop below the sticky 48px tab-bar so it never hides the strip. */
    .audio-fab.theme-material { top: 58px; }
    /* Brutalism: clear the sticky scrolling ticker pinned at the very top. */
    .audio-fab.theme-brutalism { top: 48px; }
    /* Web 1.0: tuck it just left of the Netscape "N" throbber in the toolbar. */
    .audio-fab.theme-web1 { top: 30px; right: 54px; }
    /* WinXP: leave the top strip free for the desktop icons — sit bottom-left.
       The Timeline rides higher here (it clears the XP taskbar), so lift the
       toggle well above it. */
    .audio-fab.theme-winxp { top: auto; bottom: 132px; left: 14px; right: auto; }
  }
</style>
