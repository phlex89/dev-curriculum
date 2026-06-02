<script lang="ts">
  import { onMount } from 'svelte';
  import { currentTheme, type Theme } from '../store';
  import { prefetchTheme } from '../themes/registry';

  const themes: { id: Theme; label: string; year: string; icon: string }[] = [
    { id: 'terminal', label: 'Terminal', year: '1980s', icon: '⌨️' },
    { id: 'pixel', label: 'Pixel Art', year: '1988', icon: '🎮' },
    { id: 'web1', label: 'Web 1.0', year: '1996', icon: '🌐' },
    { id: 'winxp', label: 'Win XP', year: '2001', icon: '🪟' },
    { id: 'skeuo', label: 'Skeuomorph', year: '2010', icon: '💎' },
    { id: 'material', label: 'Material', year: '2014', icon: '📐' },
    { id: 'brutalism', label: 'Brutalism', year: '2017', icon: '🧱' },
    { id: 'bento', label: 'Modern Flat', year: '2015', icon: '📱' },
    { id: 'glass', label: 'Glass', year: '2020', icon: '🧊' },
    { id: 'threed', label: 'Future 3D', year: '2026', icon: '🌌' }
  ];

  const HINT_KEY = 'cv_seen_timeline';

  let tabButtons = $state<HTMLButtonElement[]>([]);
  let showHint = $state(false);

  const activeIndex = $derived(Math.max(0, themes.findIndex((t) => t.id === $currentTheme)));
  const fillFraction = $derived(activeIndex / (themes.length - 1));
  const activeTheme = $derived(themes[activeIndex]);

  onMount(() => {
    let seen = false;
    try {
      seen = !!localStorage.getItem(HINT_KEY);
    } catch {
      /* storage blocked */
    }
    if (!seen) {
      showHint = true;
      setTimeout(dismissHint, 6000);
    }
  });

  function dismissHint() {
    if (!showHint) return;
    showHint = false;
    try {
      localStorage.setItem(HINT_KEY, '1');
    } catch {
      /* ignore */
    }
  }

  function selectTheme(t: Theme) {
    dismissHint(); // first interaction dissolves the welcome hint
    currentTheme.set(t);
  }

  function handleKeydown(e: KeyboardEvent, index: number) {
    let next = index;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        next = (index + 1) % themes.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        next = (index - 1 + themes.length) % themes.length;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = themes.length - 1;
        break;
      default:
        return; // Enter/Space fall through to native button activation
    }
    e.preventDefault();
    selectTheme(themes[next].id);
    tabButtons[next]?.focus();
  }
</script>

<div class="timeline-wrapper theme-{$currentTheme}" style="--fill: {fillFraction}">
  {#if showHint}
    <div class="timeline-hint" role="status">
      Sei in <strong>{activeTheme.year} · {activeTheme.label}</strong>. Viaggia nel tempo <span class="hint-arrow">→</span>
    </div>
  {/if}
  <nav class="timeline-container" aria-label="Linea del tempo: scegli l'era">
    <div class="timeline-track"></div>
    <div class="timeline-fill"></div>
    <ul class="timeline-stops" role="tablist" aria-orientation="horizontal">
      {#each themes as theme, i}
        <li class="timeline-stop" class:active="{$currentTheme === theme.id}">
          <button
            role="tab"
            id="timeline-tab-{theme.id}"
            aria-selected={$currentTheme === theme.id}
            tabindex={$currentTheme === theme.id ? 0 : -1}
            bind:this={tabButtons[i]}
            onclick={() => selectTheme(theme.id)}
            onmouseenter={() => prefetchTheme(theme.id)}
            onfocus={() => prefetchTheme(theme.id)}
            onkeydown={(e) => handleKeydown(e, i)}
            aria-label="{theme.year} - {theme.label}"
          >
            <div class="node-pill">
              <span class="icon">{theme.icon}</span>
              {#if $currentTheme === theme.id}
                <span class="label-text">{theme.year} - {theme.label}</span>
              {/if}
            </div>
          </button>
        </li>
      {/each}
    </ul>
  </nav>
</div>

<style>
  /* Base Timeline Styling (Modern Glass Pill) */
  .timeline-wrapper {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9999;
    display: flex;
    justify-content: center;
    transition: all 0.3s ease;
  }

  .timeline-container {
    position: relative;
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.4);
    border-radius: 40px;
    padding: 8px 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }

  .timeline-track {
    position: absolute;
    top: 50%;
    left: 25px;
    right: 25px;
    height: 2px;
    background: rgba(0, 0, 0, 0.1);
    transform: translateY(-50%);
    z-index: 0;
  }

  /* Progress fill: how far along the timeline (the eras) you currently are */
  .timeline-fill {
    position: absolute;
    top: 50%;
    left: 25px;
    height: 2px;
    width: calc((100% - 50px) * var(--fill, 0));
    transform: translateY(-50%);
    background: linear-gradient(90deg, #0071e3, #4f46e5);
    z-index: 0;
    transition: width 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  }

  /* First-visit welcome hint */
  .timeline-hint {
    position: absolute;
    bottom: calc(100% + 14px);
    left: 50%;
    transform: translateX(-50%);
    white-space: nowrap;
    background: rgba(20, 20, 30, 0.92);
    color: #fff;
    font-family: 'Space Grotesk', -apple-system, sans-serif;
    font-size: 0.85rem;
    padding: 9px 16px;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    animation: hintPulse 2s ease-in-out infinite;
  }
  .timeline-hint strong { font-weight: 600; }
  .timeline-hint::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 7px solid transparent;
    border-top-color: rgba(20, 20, 30, 0.92);
  }
  .hint-arrow { display: inline-block; animation: hintArrow 1.2s ease-in-out infinite; }

  @keyframes hintPulse {
    0%, 100% { transform: translateX(-50%) translateY(0); }
    50% { transform: translateX(-50%) translateY(-4px); }
  }
  @keyframes hintArrow {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(4px); }
  }
  @media (prefers-reduced-motion: reduce) {
    .timeline-hint, .hint-arrow { animation: none; }
  }

  .timeline-stops {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    gap: 25px;
    align-items: center;
    position: relative;
    z-index: 1;
  }

  .timeline-stop button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    margin: 0;
    outline: none;
    font-family: inherit;
    color: #333;
  }

  /* Visible, theme-aware focus ring for keyboard navigation */
  .timeline-stop button:focus-visible .node-pill {
    outline: 2px solid #0071e3;
    outline-offset: 3px;
  }
  :global(:root) .theme-terminal .timeline-stop button:focus-visible .node-pill {
    outline: 1px solid #00ff00;
    outline-offset: 2px;
  }
  :global(:root) .theme-threed .timeline-stop button:focus-visible .node-pill {
    outline: 2px solid #00ffff;
    outline-offset: 3px;
  }
  :global(:root) .theme-winxp .timeline-stop button:focus-visible .node-pill {
    outline: 1px dotted #000;
    outline-offset: 1px;
  }

  .node-pill {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 30px;
    background: rgba(0, 0, 0, 0.05);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    min-width: 40px;
    justify-content: center;
  }

  .timeline-stop:hover .node-pill {
    background: rgba(0, 0, 0, 0.1);
  }

  .timeline-stop.active .node-pill {
    background: #0071e3;
    color: white;
    box-shadow: 0 4px 15px rgba(0, 113, 227, 0.4);
    padding: 8px 20px;
  }

  .icon {
    font-size: 1.1rem;
    line-height: 1;
  }

  .label-text {
    font-size: 0.9rem;
    font-weight: 600;
    white-space: nowrap;
    animation: fadeIn 0.3s ease-in-out forwards;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateX(-5px); }
    to { opacity: 1; transform: translateX(0); }
  }

  /* --- Terminal Theme Adaptations --- */
  :global(:root) .theme-terminal .timeline-container {
    background: #000;
    border: 1px solid #00ff00;
    border-radius: 0;
    box-shadow: 0 0 10px rgba(0, 255, 0, 0.2);
    backdrop-filter: none;
  }

  :global(:root) .theme-terminal .timeline-track {
    background: transparent;
    border-top: 1px dashed #004400;
  }

  :global(:root) .theme-terminal .node-pill {
    background: #000;
    color: #00ff00;
    border: 1px dashed #004400;
    border-radius: 0;
  }

  :global(:root) .theme-terminal .timeline-stop.active .node-pill {
    background: #004400;
    color: #00ff00;
    border: 1px solid #00ff00;
    box-shadow: inset 0 0 10px #00ff00;
  }

  :global(:root) .theme-terminal .label-text {
    font-family: 'Courier New', Courier, monospace;
    font-weight: normal;
  }

  /* --- Pixel Art Theme Adaptations (NES dialog-box chrome, no blur) --- */
  :global(:root) .theme-pixel .timeline-container {
    background: #1c1c2e;
    border: 3px solid #fcfcfc;
    border-radius: 0;
    box-shadow: 3px 3px 0 #000;
    backdrop-filter: none;
  }

  :global(:root) .theme-pixel .timeline-track {
    background: transparent;
    border-top: 2px dotted #6b6bff;
  }

  :global(:root) .theme-pixel .node-pill {
    background: #1c1c2e;
    color: #fcfcfc;
    border: 2px solid #6b6bff;
    border-radius: 0;
    image-rendering: pixelated;
  }

  :global(:root) .theme-pixel .timeline-stop:hover .node-pill {
    background: #2b39ff;
    color: #fcfcfc;
  }

  :global(:root) .theme-pixel .timeline-stop.active .node-pill {
    background: #d82800;
    color: #fcfcfc;
    border: 2px solid #fcfcfc;
    box-shadow: 2px 2px 0 #000;
  }

  :global(:root) .theme-pixel .label-text {
    font-family: 'Press Start 2P', 'JetBrains Mono', monospace;
    font-weight: 400;
    font-size: 0.6rem;
    text-transform: uppercase;
  }

  /* --- Web 1.0 Theme Adaptations (silver Netscape/Win95 bevel, Times) --- */
  :global(:root) .theme-web1 .timeline-container {
    background: #c0c0c0;
    border: 2px outset #f5f5f5;
    border-radius: 0;
    box-shadow: 1px 1px 0 #808080, 2px 2px 4px rgba(0, 0, 0, 0.4);
    backdrop-filter: none;
  }

  :global(:root) .theme-web1 .timeline-track {
    background: transparent;
    border-top: 2px groove #fff;
  }

  :global(:root) .theme-web1 .node-pill {
    background: #c0c0c0;
    border: 2px outset #f5f5f5;
    border-radius: 0;
    color: #000080;
  }

  :global(:root) .theme-web1 .timeline-stop:hover .node-pill {
    background: #d4d0c8;
  }

  :global(:root) .theme-web1 .timeline-stop.active .node-pill {
    background: #000080;
    color: #fff;
    border: 2px inset #f5f5f5;
    box-shadow: none;
  }

  :global(:root) .theme-web1 .label-text {
    font-family: 'Times New Roman', Times, serif;
    font-weight: 700;
  }

  :global(:root) .theme-web1 .timeline-fill {
    background: #000080;
    box-shadow: none;
  }

  /* --- WinXP Theme Adaptations --- */
  :global(:root) .theme-winxp {
    bottom: 40px;
  }

  :global(:root) .theme-winxp .timeline-container {
    background: #ece9d8;
    border: 2px outset #fff;
    border-radius: 0;
    box-shadow: 2px 2px 5px rgba(0,0,0,0.3);
    backdrop-filter: none;
  }

  :global(:root) .theme-winxp .timeline-track {
    background: #a9a9a9;
    border-bottom: 1px solid #fff;
  }

  :global(:root) .theme-winxp .node-pill {
    background: transparent;
    border: 1px solid transparent;
    border-radius: 0;
    color: #000;
  }

  :global(:root) .theme-winxp .timeline-stop:hover .node-pill {
    border: 1px outset #fff;
    background: #ddd;
  }

  :global(:root) .theme-winxp .timeline-stop.active .node-pill {
    background: #0058e6;
    color: white;
    border: 1px inset #000;
    box-shadow: none;
  }

  :global(:root) .theme-winxp .label-text {
    font-family: Tahoma, 'Segoe UI', sans-serif;
  }

  /* --- Skeuomorphism Theme Adaptations (brushed metal + gel) --- */
  :global(:root) .theme-skeuo .timeline-container {
    background: linear-gradient(180deg, #fcfcfd 0%, #e2e2e6 40%, #c6c6cb 100%);
    border: 1px solid #9a9aa0;
    border-radius: 30px;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9), 0 2px 0 #8d8d92, 0 8px 20px rgba(0, 0, 0, 0.4);
    backdrop-filter: none;
  }

  :global(:root) .theme-skeuo .timeline-track {
    background: rgba(0, 0, 0, 0.18);
    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.6);
  }

  :global(:root) .theme-skeuo .node-pill {
    background: linear-gradient(180deg, #ffffff, #d4d4d9);
    border: 1px solid #a8a8ae;
    color: #4a4a50;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9), 0 1px 2px rgba(0, 0, 0, 0.3);
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.7);
  }

  :global(:root) .theme-skeuo .timeline-stop.active .node-pill {
    background: linear-gradient(180deg, #4f97e6 0%, #2f6fd0 50%, #2560bd 100%);
    border: 1px solid #1f5bb0;
    color: #fff;
    text-shadow: 0 -1px 1px rgba(0, 0, 0, 0.4);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.5), 0 2px 5px rgba(0, 0, 0, 0.4);
  }

  :global(:root) .theme-skeuo .label-text {
    font-family: 'Lucida Grande', 'Helvetica Neue', Helvetica, sans-serif;
    font-weight: 700;
  }

  /* --- Material Design Theme Adaptations (flat surface, elevation, ink bar) --- */
  :global(:root) .theme-material .timeline-container {
    background: #fff;
    border: none;
    border-radius: 8px;
    box-shadow:
      0 3px 5px -1px rgba(0, 0, 0, 0.2),
      0 6px 10px 0 rgba(0, 0, 0, 0.14),
      0 1px 18px 0 rgba(0, 0, 0, 0.12);
    backdrop-filter: none;
  }

  :global(:root) .theme-material .timeline-track {
    background: rgba(0, 0, 0, 0.12);
  }

  :global(:root) .theme-material .node-pill {
    background: transparent;
    border-radius: 6px;
    color: rgba(0, 0, 0, 0.6);
  }

  :global(:root) .theme-material .timeline-stop:hover .node-pill {
    background: rgba(63, 81, 181, 0.08);
  }

  :global(:root) .theme-material .timeline-stop.active .node-pill {
    background: #3f51b5;
    color: #fff;
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2), 0 2px 2px rgba(0, 0, 0, 0.14);
  }

  :global(:root) .theme-material .label-text {
    font-family: 'Roboto', 'Helvetica Neue', Arial, sans-serif;
    font-weight: 500;
    letter-spacing: 0.04em;
  }

  :global(:root) .theme-material .timeline-fill {
    background: linear-gradient(90deg, #3f51b5, #ff4081);
    box-shadow: none;
  }

  /* --- Brutalism Theme Adaptations (raw ink + hard offset, mono) --- */
  :global(:root) .theme-brutalism .timeline-container {
    background: #f3efe2;
    border: 3px solid #0c0c0c;
    border-radius: 0;
    box-shadow: 5px 5px 0 #0c0c0c;
    backdrop-filter: none;
  }

  :global(:root) .theme-brutalism .timeline-track {
    background: transparent;
    border-top: 3px dotted #0c0c0c;
  }

  :global(:root) .theme-brutalism .node-pill {
    background: #f3efe2;
    color: #0c0c0c;
    border: 2px solid #0c0c0c;
    border-radius: 0;
  }

  :global(:root) .theme-brutalism .timeline-stop:hover .node-pill {
    background: #0c0c0c;
    color: #f3efe2;
  }

  :global(:root) .theme-brutalism .timeline-stop.active .node-pill {
    background: #e9ff1a;
    color: #0c0c0c;
    border: 2px solid #0c0c0c;
    box-shadow: 3px 3px 0 #0c0c0c;
  }

  :global(:root) .theme-brutalism .label-text {
    font-family: 'Space Mono', monospace;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }

  /* --- Glassmorphism Theme Adaptations (frosted milky pill, light Big Sur) --- */
  :global(:root) .theme-glass .timeline-container {
    background: rgba(255, 255, 255, 0.45);
    border: 1px solid rgba(255, 255, 255, 0.6);
    border-radius: 40px;
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    backdrop-filter: blur(20px) saturate(180%);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7), 0 10px 30px rgba(31, 38, 135, 0.18);
  }

  :global(:root) .theme-glass .timeline-track {
    background: rgba(255, 255, 255, 0.5);
  }

  :global(:root) .theme-glass .node-pill {
    background: rgba(255, 255, 255, 0.35);
    border: 1px solid rgba(255, 255, 255, 0.5);
    color: #3b3a52;
  }

  :global(:root) .theme-glass .timeline-stop:hover .node-pill {
    background: rgba(255, 255, 255, 0.6);
  }

  :global(:root) .theme-glass .timeline-stop.active .node-pill {
    background: rgba(124, 116, 255, 0.42);
    border: 1px solid rgba(255, 255, 255, 0.8);
    color: #fff;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 6px 16px rgba(124, 116, 255, 0.4);
  }

  :global(:root) .theme-glass .label-text {
    font-family: 'Inter', -apple-system, sans-serif;
    font-weight: 500;
    letter-spacing: 0.01em;
  }

  :global(:root) .theme-glass .timeline-fill {
    background: linear-gradient(90deg, #7cc5ff, #a78bfa, #f9a8d4);
    box-shadow: none;
  }

  /* --- ThreeD Theme Adaptations --- */
  :global(:root) .theme-threed .timeline-container {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  }

  :global(:root) .theme-threed .timeline-track {
    background: rgba(255, 255, 255, 0.2);
    box-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
  }

  :global(:root) .theme-threed .node-pill {
    color: #fff;
    background: rgba(255, 255, 255, 0.1);
  }

  :global(:root) .theme-threed .timeline-stop.active .node-pill {
    background: rgba(0, 255, 255, 0.3);
    border: 1px solid #00ffff;
    color: #00ffff;
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
  }

  :global(:root) .theme-threed .label-text {
    text-shadow: 0 2px 5px rgba(0,0,0,1);
    font-family: 'Orbitron', 'Space Grotesk', sans-serif;
    font-weight: 500;
    letter-spacing: 0.5px;
  }

  /* --- Modern Flat (Bento) Theme Adaptations --- */
  :global(:root) .theme-bento .label-text {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 600;
    letter-spacing: 0.2px;
  }

  /* --- Per-theme progress fill --- */
  :global(:root) .theme-terminal .timeline-fill {
    background: #00ff00;
    box-shadow: 0 0 8px rgba(0, 255, 0, 0.6);
  }
  :global(:root) .theme-winxp .timeline-fill {
    background: linear-gradient(90deg, #245edb, #0058e6);
    box-shadow: none;
  }
  :global(:root) .theme-skeuo .timeline-fill {
    background: linear-gradient(90deg, #2f8fe0, #7fd0ff);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
  }
  :global(:root) .theme-brutalism .timeline-fill {
    background: #0c0c0c;
    box-shadow: none;
  }
  :global(:root) .theme-threed .timeline-fill {
    background: linear-gradient(90deg, #7df9ff, #00ffff);
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.6);
  }
  :global(:root) .theme-pixel .timeline-fill {
    background: #fcd800;
    box-shadow: none;
  }
</style>
