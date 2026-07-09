<script lang="ts">
  import { currentTheme } from '../store';
  import { lang, type Lang } from '../i18n';
  import { ui } from '../translations';
  import { trackEvent } from '../analytics';

  const t = $derived(ui[$lang].shared);

  function setLang(l: Lang) {
    if (l === $lang) return;
    lang.set(l);
    trackEvent(`lang-${l}`);
  }
</script>

<div class="lang-switch theme-{$currentTheme}" role="group" aria-label={t.langSwitchLabel}>
  <button
    class="seg"
    class:active={$lang === 'it'}
    onclick={() => setLang('it')}
    aria-pressed={$lang === 'it'}
    aria-label={t.langItalian}
    title={t.langItalian}
    lang="it"
  >IT</button>
  <button
    class="seg"
    class:active={$lang === 'en'}
    onclick={() => setLang('en')}
    aria-pressed={$lang === 'en'}
    aria-label={t.langEnglish}
    title={t.langEnglish}
    lang="en"
  >EN</button>
</div>

<style>
  /* Stacked right above the audio toggle (bottom-left column): beside it, it
     would collide with the Timeline's left edge on wide viewports. Every era
     restyles it via the custom-property tokens below, mirroring the
     audio-fab / EraVote skins. */
  .lang-switch {
    position: fixed;
    bottom: 72px;
    left: 20px;
    z-index: 9999;
    height: 36px;
    display: flex;
    align-items: stretch;
    overflow: hidden;
    border-radius: var(--ls-radius, 21px);
    border: var(--ls-border, 1px solid rgba(255, 255, 255, 0.4));
    background: var(--ls-bg, rgba(255, 255, 255, 0.7));
    box-shadow: var(--ls-shadow, 0 10px 30px rgba(0, 0, 0, 0.12));
    backdrop-filter: var(--ls-blur, blur(12px));
    -webkit-backdrop-filter: var(--ls-blur, blur(12px));
    font-family: var(--ls-font, -apple-system, 'Segoe UI', sans-serif);
    transition: background 0.25s ease, border-color 0.3s ease, box-shadow 0.3s ease, bottom 0.3s ease;
  }

  .seg {
    appearance: none;
    border: none;
    margin: 0;
    padding: 0 13px;
    background: transparent;
    color: var(--ls-fg, #333);
    font-family: inherit;
    font-size: var(--ls-size, 0.72rem);
    font-weight: 700;
    letter-spacing: 0.06em;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: background 0.2s ease, color 0.2s ease;
  }
  .seg + .seg {
    border-left: var(--ls-divider, 1px solid rgba(0, 0, 0, 0.08));
  }
  .seg.active {
    background: var(--ls-active-bg, rgba(0, 113, 227, 0.9));
    color: var(--ls-active-fg, #fff);
    cursor: default;
  }
  .seg:not(.active):hover {
    background: var(--ls-hover-bg, rgba(0, 0, 0, 0.06));
  }
  .seg:focus-visible {
    outline: 2px solid var(--ls-focus, #0071e3);
    outline-offset: -2px;
  }

  /* ── Per-era skins ─────────────────────────────────────────────────────── */

  .lang-switch.theme-terminal {
    /* The terminal's quick-command buttons own the bottom-left corner — the
       top-right of the screen is the only reliably empty area of this era. */
    bottom: auto;
    top: 20px;
    right: 20px;
    left: auto;
    --ls-bg: #000;
    --ls-fg: #00ff00;
    --ls-border: 1px solid #00ff00;
    --ls-radius: 0;
    --ls-shadow: 0 0 10px rgba(0, 255, 0, 0.2);
    --ls-blur: none;
    --ls-divider: 1px solid #00ff00;
    --ls-active-bg: #00ff00;
    --ls-active-fg: #000;
    --ls-hover-bg: #002200;
    --ls-focus: #00ff00;
    --ls-font: 'JetBrains Mono', 'Courier New', monospace;
  }

  .lang-switch.theme-teletext {
    --ls-bg: #000;
    --ls-fg: #ffff00;
    --ls-border: 2px solid #ffff00;
    --ls-radius: 0;
    --ls-shadow: none;
    --ls-blur: none;
    --ls-divider: 2px solid #ffff00;
    --ls-active-bg: #0000ff;
    --ls-active-fg: #fff;
    --ls-hover-bg: #111;
    --ls-focus: #00ffff;
    --ls-font: 'Bedstead', 'JetBrains Mono', monospace;
  }

  .lang-switch.theme-pixel {
    --ls-bg: #1c1c2e;
    --ls-fg: #fcfcfc;
    --ls-border: 3px solid #fcfcfc;
    --ls-radius: 0;
    --ls-shadow: 3px 3px 0 #000;
    --ls-blur: none;
    --ls-divider: 3px solid #fcfcfc;
    --ls-active-bg: #d82800;
    --ls-active-fg: #fcfcfc;
    --ls-hover-bg: #34345c;
    --ls-focus: #fcfcfc;
    --ls-font: 'Press Start 2P', 'JetBrains Mono', monospace;
    --ls-size: 0.55rem;
    image-rendering: pixelated;
  }

  .lang-switch.theme-web1 {
    --ls-bg: #c0c0c0;
    --ls-fg: #000080;
    --ls-border: 2px outset #f5f5f5;
    --ls-radius: 0;
    --ls-shadow: 1px 1px 0 #808080, 2px 2px 4px rgba(0, 0, 0, 0.4);
    --ls-blur: none;
    --ls-divider: 1px solid #808080;
    --ls-active-bg: #000080;
    --ls-active-fg: #fff;
    --ls-hover-bg: #d4d4d4;
    --ls-focus: #000080;
    --ls-font: 'Times New Roman', Times, serif;
    --ls-size: 0.78rem;
  }

  .lang-switch.theme-winxp {
    bottom: 92px; /* the audio toggle sits at 40px here (XP taskbar) — stay above it */
    --ls-bg: #ece9d8;
    --ls-fg: #000;
    --ls-border: 2px outset #fff;
    --ls-radius: 0;
    --ls-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
    --ls-blur: none;
    --ls-divider: 1px solid #aca899;
    --ls-active-bg: #0058e6;
    --ls-active-fg: #fff;
    --ls-hover-bg: #f6f4ea;
    --ls-focus: #0058e6;
    --ls-font: Tahoma, 'Segoe UI', sans-serif;
  }

  .lang-switch.theme-skeuo {
    --ls-bg: linear-gradient(180deg, #fcfcfd, #c9c9ce);
    --ls-fg: #4a4a50;
    --ls-border: 1px solid #9a9aa0;
    --ls-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9), 0 2px 0 #8d8d92, 0 6px 14px rgba(0, 0, 0, 0.4);
    --ls-blur: none;
    --ls-divider: 1px solid #9a9aa0;
    --ls-active-bg: linear-gradient(180deg, #7fd0ff, #2f8fe0);
    --ls-active-fg: #fff;
    --ls-hover-bg: rgba(255, 255, 255, 0.55);
    --ls-focus: #2f8fe0;
    --ls-font: 'Lucida Grande', 'Helvetica Neue', Helvetica, sans-serif;
  }

  .lang-switch.theme-material {
    --ls-bg: #fff;
    --ls-fg: #5c6bc0;
    --ls-border: none;
    --ls-shadow: 0 3px 5px -1px rgba(0, 0, 0, 0.2), 0 6px 10px 0 rgba(0, 0, 0, 0.14), 0 1px 18px 0 rgba(0, 0, 0, 0.12);
    --ls-blur: none;
    --ls-divider: 1px solid rgba(0, 0, 0, 0.12);
    --ls-active-bg: #3f51b5;
    --ls-active-fg: #fff;
    --ls-hover-bg: rgba(63, 81, 181, 0.08);
    --ls-focus: #3f51b5;
    --ls-font: 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  }

  .lang-switch.theme-brutalism {
    --ls-bg: #f3efe2;
    --ls-fg: #0c0c0c;
    --ls-border: 3px solid #0c0c0c;
    --ls-radius: 0;
    --ls-shadow: 4px 4px 0 #0c0c0c;
    --ls-blur: none;
    --ls-divider: 3px solid #0c0c0c;
    --ls-active-bg: #e9ff1a;
    --ls-active-fg: #0c0c0c;
    --ls-hover-bg: #fff;
    --ls-focus: #0c0c0c;
    --ls-font: 'Space Mono', monospace;
  }

  .lang-switch.theme-parallax {
    --ls-bg: rgba(243, 239, 231, 0.85);
    --ls-fg: #6b6a4b;
    --ls-border: 1px solid rgba(40, 38, 34, 0.16);
    --ls-shadow: 0 10px 30px rgba(40, 38, 34, 0.12);
    --ls-blur: blur(10px);
    --ls-divider: 1px solid rgba(40, 38, 34, 0.14);
    --ls-active-bg: #6b6a4b;
    --ls-active-fg: #f3efe7;
    --ls-hover-bg: rgba(40, 38, 34, 0.06);
    --ls-focus: #6b6a4b;
    --ls-font: 'Inter', -apple-system, sans-serif;
  }

  .lang-switch.theme-glass {
    --ls-bg: rgba(255, 255, 255, 0.45);
    --ls-fg: #4338ca;
    --ls-border: 1px solid rgba(255, 255, 255, 0.6);
    --ls-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7), 0 8px 24px rgba(31, 38, 135, 0.18);
    --ls-blur: blur(18px) saturate(180%);
    --ls-divider: 1px solid rgba(255, 255, 255, 0.55);
    --ls-active-bg: rgba(124, 116, 255, 0.42);
    --ls-active-fg: #fff;
    --ls-hover-bg: rgba(255, 255, 255, 0.4);
    --ls-focus: #4338ca;
    --ls-font: 'Inter', -apple-system, sans-serif;
  }

  .lang-switch.theme-threed {
    --ls-bg: rgba(255, 255, 255, 0.08);
    --ls-fg: #fff;
    --ls-border: 1px solid rgba(255, 255, 255, 0.2);
    --ls-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    --ls-blur: blur(12px);
    --ls-divider: 1px solid rgba(255, 255, 255, 0.2);
    --ls-active-bg: rgba(0, 255, 255, 0.25);
    --ls-active-fg: #00ffff;
    --ls-hover-bg: rgba(255, 255, 255, 0.12);
    --ls-focus: #00ffff;
    --ls-font: 'Orbitron', 'Space Grotesk', sans-serif;
  }

  @media (max-width: 720px) {
    /* The audio toggle moves to the top-right corner here — the switch follows,
       sitting just to its left, mirroring its per-era nudges. */
    .lang-switch {
      top: 14px;
      right: 60px;
      left: auto;
      bottom: auto;
      height: 38px;
    }
    .lang-switch .seg {
      padding: 0 11px;
    }
    .lang-switch.theme-material { top: 58px; }
    .lang-switch.theme-brutalism { top: 48px; }
    .lang-switch.theme-web1 { top: 30px; right: 100px; }
    .lang-switch.theme-winxp {
      top: auto;
      bottom: 132px;
      left: 60px;
      right: auto;
    }
  }
</style>
