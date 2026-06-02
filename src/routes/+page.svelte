<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { currentTheme, ERA_ORDER, type Theme } from '$lib/store';
  import { initAudio, playEra, toggleAudio, audioEnabled } from '$lib/audio';
  import Timeline from '$lib/components/Timeline.svelte';

  // Theme Components
  import TerminalTheme from '$lib/themes/Terminal.svelte';
  import PixelArtTheme from '$lib/themes/PixelArt.svelte';
  import WinXPTheme from '$lib/themes/WinXP.svelte';
  import SkeuoTheme from '$lib/themes/Skeuo.svelte';
  import BrutalismTheme from '$lib/themes/Brutalism.svelte';
  import BentoTheme from '$lib/themes/BentoBox.svelte';
  import ThreeDTheme from '$lib/themes/ThreeD.svelte';

  const eraLabels: Record<string, string> = {
    terminal: 'Terminale · 1980s',
    pixel: 'Pixel Art · 1988',
    winxp: 'Windows XP · 2001',
    skeuo: 'Skeuomorphism · 2010',
    brutalism: 'Brutalism · 2017',
    bento: 'Modern Flat · 2015',
    threed: 'Future 3D · 2026'
  };

  const pageTitle = $derived(`Stefano Tedeschi — CV · ${eraLabels[$currentTheme] ?? 'Time-Machine Resume'}`);

  const prefersReduced = () =>
    typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Gate the first paint: until the real era is resolved from the URL/localStorage
  // we render nothing, so the visitor never sees the default (bento) flash and the
  // cross-dissolve/time-travel FX don't fire on load — just a clean fade-in.
  let booted = $state(false);

  // Directional time-travel transition: glitch going back, bloom going forward.
  let fxClass = $state<'fx-back' | 'fx-forward' | null>(null);
  let fxKey = $state(0);
  let prevIdx = -1;

  $effect(() => {
    const idx = ERA_ORDER.indexOf($currentTheme);
    if (!booted) {
      prevIdx = idx; // before boot: just track the era, never animate
      return;
    }
    if (idx === prevIdx) return;
    const dir = idx > prevIdx ? 'fx-forward' : 'fx-back';
    prevIdx = idx;

    playEra($currentTheme); // no-op unless the visitor opted into audio

    if (!prefersReduced()) {
      fxClass = dir;
      fxKey++; // re-mount the overlay so its animation replays
    }
  });

  function onAudioToggle() {
    const on = toggleAudio();
    if (on) playEra($currentTheme); // confirm with the current era's cue
  }

  onMount(() => {
    currentTheme.init(); // resolves the real era synchronously (URL hash / saved pref)
    initAudio();

    // Sync prevIdx to the resolved era so unlocking `booted` doesn't read as a
    // navigation — then reveal, letting the theme layer fade in for the first time.
    prevIdx = ERA_ORDER.indexOf($currentTheme);
    booted = true;

    // Keep the active era in sync with the URL (deep-links, back/forward navigation).
    const onHash = () => {
      const t = location.hash.slice(1);
      if ((['terminal', 'pixel', 'winxp', 'skeuo', 'brutalism', 'bento', 'threed'] as const).includes(t as Theme)) {
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
  {#if booted}
    {#key $currentTheme}
      <div class="theme-layer" in:fade={{ duration: 450, delay: 120 }} out:fade={{ duration: 300 }}>
        {#if $currentTheme === 'terminal'}
          <TerminalTheme />
        {:else if $currentTheme === 'pixel'}
          <PixelArtTheme />
        {:else if $currentTheme === 'winxp'}
          <WinXPTheme />
        {:else if $currentTheme === 'skeuo'}
          <SkeuoTheme />
        {:else if $currentTheme === 'brutalism'}
          <BrutalismTheme />
        {:else if $currentTheme === 'bento'}
          <BentoTheme />
        {:else if $currentTheme === 'threed'}
          <ThreeDTheme />
        {/if}
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

  <Timeline />
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

  /* Each theme fades in/out over the other for a smooth cross-dissolve */
  .theme-layer {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
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

  @media (max-width: 500px) {
    .audio-fab { bottom: 16px; left: 16px; width: 38px; height: 38px; }
    .audio-fab.theme-winxp { bottom: 40px; }
  }
</style>
