<script lang="ts">
  import { onMount } from 'svelte';
  import { currentTheme } from '../store';
  import { ERA_META } from '../era-meta';
  import { initVotes, loadTotals, toggleVote, votesState } from '../votes.svelte';

  let open = $state(false);
  let widget = $state<HTMLElement | undefined>();

  const liked = $derived(votesState.liked.includes($currentTheme));
  const count = $derived(votesState.totals?.[$currentTheme] ?? null);
  const activeMeta = $derived(ERA_META.find((e) => e.id === $currentTheme));

  const ranking = $derived(
    votesState.totals
      ? ERA_META.map((e) => ({ ...e, votes: votesState.totals?.[e.id] ?? 0 })).sort(
          (a, b) => b.votes - a.votes
        )
      : []
  );
  const maxVotes = $derived(ranking.length ? Math.max(1, ranking[0].votes) : 1);

  function togglePanel() {
    open = !open;
    if (open && !votesState.totals) loadTotals();
  }

  onMount(() => {
    initVotes();
    const onDown = (e: PointerEvent) => {
      if (open && widget && !widget.contains(e.target as Node)) open = false;
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') open = false;
    };
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  });
</script>

<div class="vote-widget theme-{$currentTheme}" bind:this={widget}>
  {#if open}
    <div class="vote-panel" role="dialog" aria-label="Classifica delle ere">
      <p class="vote-panel-title">Le ere più amate</p>
      {#if ranking.length}
        <ol class="vote-ranking">
          {#each ranking as row (row.id)}
            <li class:current={row.id === $currentTheme}>
              <span class="rank-icon" aria-hidden="true">{row.icon}</span>
              <span class="rank-label">{row.label}</span>
              <span class="rank-bar" aria-hidden="true">
                <span class="rank-fill" style="width: {(row.votes / maxVotes) * 100}%"></span>
              </span>
              <span class="rank-votes">{row.votes}</span>
              <span class="rank-liked" class:on={votesState.liked.includes(row.id)} aria-hidden="true">♥</span>
            </li>
          {/each}
        </ol>
      {:else if votesState.totalsFailed}
        <p class="vote-panel-empty">Classifica non disponibile in questo momento.</p>
      {:else}
        <p class="vote-panel-empty">Classifica in caricamento…</p>
      {/if}
    </div>
  {/if}
  <div class="vote-pill">
    <button
      class="vote-heart"
      class:liked
      onclick={() => toggleVote($currentTheme)}
      aria-pressed={liked}
      aria-label={liked
        ? `Togli il mi piace all'era ${activeMeta?.label}`
        : `Metti mi piace all'era ${activeMeta?.label}`}
      title={liked ? 'Ti piace questa era' : 'Vota questa era'}
    >
      <span class="heart-glyph" aria-hidden="true">♥</span>
    </button>
    <button
      class="vote-count"
      onclick={togglePanel}
      aria-expanded={open}
      aria-label="Vedi la classifica delle ere"
      title="Classifica delle ere"
    >
      {count ?? '★'}
    </button>
  </div>
</div>

<style>
  .vote-widget {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 9999;
    font-family: 'Space Grotesk', -apple-system, sans-serif;
    --vote-bg: rgba(255, 255, 255, 0.7);
    --vote-border: 1px solid rgba(255, 255, 255, 0.4);
    --vote-color: #333;
    --vote-accent: #ff2d55;
    --vote-radius: 30px;
    --vote-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
    --vote-blur: blur(12px);
    --vote-bar: rgba(0, 0, 0, 0.08);
  }

  .vote-pill {
    display: flex;
    align-items: stretch;
    height: 42px;
    border: var(--vote-border);
    border-radius: var(--vote-radius);
    background: var(--vote-bg);
    color: var(--vote-color);
    box-shadow: var(--vote-shadow);
    -webkit-backdrop-filter: var(--vote-blur);
    backdrop-filter: var(--vote-blur);
    overflow: hidden;
  }

  .vote-pill button {
    border: none;
    background: transparent;
    color: inherit;
    font: inherit;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 12px;
  }

  .vote-heart {
    font-size: 1.15rem;
    line-height: 1;
  }

  .vote-heart .heart-glyph {
    display: inline-block;
    opacity: 0.45;
    transition: opacity 0.2s ease, transform 0.2s ease;
  }

  .vote-heart.liked .heart-glyph {
    opacity: 1;
    color: var(--vote-accent);
  }

  @media (prefers-reduced-motion: no-preference) {
    .vote-heart.liked .heart-glyph {
      animation: heartPop 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    @keyframes heartPop {
      0% { transform: scale(0.6); }
      55% { transform: scale(1.5); }
      100% { transform: scale(1); }
    }
  }

  .vote-count {
    font-size: 0.85rem;
    font-weight: 600;
    min-width: 40px;
    border-left: var(--vote-border);
  }

  .vote-count:hover,
  .vote-heart:hover {
    background: var(--vote-bar);
  }

  .vote-pill button:focus-visible {
    outline: 2px solid var(--vote-accent);
    outline-offset: -3px;
  }

  .vote-panel {
    position: absolute;
    bottom: calc(100% + 10px);
    right: 0;
    width: min(280px, calc(100vw - 28px));
    max-height: min(420px, 60vh);
    overflow-y: auto;
    padding: 14px;
    border: var(--vote-border);
    border-radius: var(--vote-radius);
    background: var(--vote-bg);
    color: var(--vote-color);
    box-shadow: var(--vote-shadow);
    -webkit-backdrop-filter: var(--vote-blur);
    backdrop-filter: var(--vote-blur);
  }

  .vote-panel-title {
    margin: 0 0 10px;
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .vote-panel-empty {
    margin: 0;
    font-size: 0.8rem;
    opacity: 0.7;
  }

  .vote-ranking {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .vote-ranking li {
    display: grid;
    grid-template-columns: 20px 82px 1fr 24px 14px;
    align-items: center;
    gap: 6px;
    font-size: 0.72rem;
  }

  .vote-ranking li.current .rank-label {
    font-weight: 700;
  }

  .rank-label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .rank-bar {
    height: 6px;
    border-radius: 3px;
    background: var(--vote-bar);
    overflow: hidden;
  }

  .rank-fill {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: var(--vote-accent);
  }

  .rank-votes {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  .rank-liked {
    opacity: 0;
    color: var(--vote-accent);
  }

  .rank-liked.on {
    opacity: 1;
  }

  .vote-widget.theme-terminal {
    font-family: 'Courier New', Courier, monospace;
    --vote-bg: #000;
    --vote-border: 1px solid #00ff00;
    --vote-color: #00ff00;
    --vote-accent: #00ff00;
    --vote-radius: 0;
    --vote-shadow: 0 0 10px rgba(0, 255, 0, 0.2);
    --vote-blur: none;
    --vote-bar: #002200;
  }

  .vote-widget.theme-teletext {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    text-transform: uppercase;
    --vote-bg: #000;
    --vote-border: 2px solid #ffff00;
    --vote-color: #ffff00;
    --vote-accent: #00ffff;
    --vote-radius: 0;
    --vote-shadow: none;
    --vote-blur: none;
    --vote-bar: #0000ff;
  }

  .vote-widget.theme-pixel {
    font-family: 'Press Start 2P', 'JetBrains Mono', monospace;
    --vote-bg: #1c1c2e;
    --vote-border: 3px solid #fcfcfc;
    --vote-color: #fcfcfc;
    --vote-accent: #d82800;
    --vote-radius: 0;
    --vote-shadow: 3px 3px 0 #000;
    --vote-blur: none;
    --vote-bar: #6b6bff;
  }
  .vote-widget.theme-pixel .vote-count { font-size: 0.6rem; }
  .vote-widget.theme-pixel .vote-ranking li { font-size: 0.5rem; }
  .vote-widget.theme-pixel .rank-fill { background: #fcd800; }

  .vote-widget.theme-web1 {
    font-family: 'Times New Roman', Times, serif;
    --vote-bg: #c0c0c0;
    --vote-border: 2px outset #f5f5f5;
    --vote-color: #000080;
    --vote-accent: #ff0000;
    --vote-radius: 0;
    --vote-shadow: 1px 1px 0 #808080, 2px 2px 4px rgba(0, 0, 0, 0.4);
    --vote-blur: none;
    --vote-bar: #fff;
  }
  .vote-widget.theme-web1 .rank-fill { background: #000080; }

  .vote-widget.theme-winxp {
    bottom: 40px;
    font-family: Tahoma, 'Segoe UI', sans-serif;
    --vote-bg: #ece9d8;
    --vote-border: 2px outset #fff;
    --vote-color: #000;
    --vote-accent: #0058e6;
    --vote-radius: 0;
    --vote-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
    --vote-blur: none;
    --vote-bar: #a9a9a9;
  }

  .vote-widget.theme-skeuo {
    font-family: 'Lucida Grande', 'Helvetica Neue', Helvetica, sans-serif;
    --vote-bg: linear-gradient(180deg, #fcfcfd, #c9c9ce);
    --vote-border: 1px solid #9a9aa0;
    --vote-color: #4a4a50;
    --vote-accent: #2f6fd0;
    --vote-radius: 30px;
    --vote-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9), 0 2px 0 #8d8d92, 0 6px 14px rgba(0, 0, 0, 0.4);
    --vote-blur: none;
    --vote-bar: rgba(0, 0, 0, 0.18);
  }

  .vote-widget.theme-material {
    font-family: 'Roboto', 'Helvetica Neue', Arial, sans-serif;
    --vote-bg: #fff;
    --vote-border: none;
    --vote-color: rgba(0, 0, 0, 0.6);
    --vote-accent: #ff4081;
    --vote-radius: 8px;
    --vote-shadow: 0 3px 5px -1px rgba(0, 0, 0, 0.2), 0 6px 10px 0 rgba(0, 0, 0, 0.14), 0 1px 18px 0 rgba(0, 0, 0, 0.12);
    --vote-blur: none;
    --vote-bar: rgba(0, 0, 0, 0.12);
  }
  .vote-widget.theme-material .vote-count { border-left: 1px solid rgba(0, 0, 0, 0.12); }
  .vote-widget.theme-material .rank-fill { background: #3f51b5; }

  .vote-widget.theme-brutalism {
    font-family: 'Space Mono', monospace;
    text-transform: uppercase;
    --vote-bg: #f3efe2;
    --vote-border: 3px solid #0c0c0c;
    --vote-color: #0c0c0c;
    --vote-accent: #0c0c0c;
    --vote-radius: 0;
    --vote-shadow: 4px 4px 0 #0c0c0c;
    --vote-blur: none;
    --vote-bar: #fff;
  }
  .vote-widget.theme-brutalism .vote-heart.liked { background: #e9ff1a; }
  .vote-widget.theme-brutalism .vote-heart.liked .heart-glyph { color: #0c0c0c; }

  .vote-widget.theme-parallax {
    font-family: 'Inter', -apple-system, sans-serif;
    --vote-bg: rgba(243, 239, 231, 0.85);
    --vote-border: 1px solid rgba(40, 38, 34, 0.16);
    --vote-color: #6b6a4b;
    --vote-accent: #b05c3f;
    --vote-radius: 30px;
    --vote-shadow: 0 10px 30px rgba(40, 38, 34, 0.12);
    --vote-blur: blur(10px);
    --vote-bar: rgba(40, 38, 34, 0.1);
  }

  .vote-widget.theme-glass {
    font-family: 'Inter', -apple-system, sans-serif;
    --vote-bg: rgba(255, 255, 255, 0.45);
    --vote-border: 1px solid rgba(255, 255, 255, 0.6);
    --vote-color: #4338ca;
    --vote-accent: #7c74ff;
    --vote-radius: 30px;
    --vote-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7), 0 8px 24px rgba(31, 38, 135, 0.18);
    --vote-blur: blur(18px) saturate(180%);
    --vote-bar: rgba(255, 255, 255, 0.5);
  }

  .vote-widget.theme-threed {
    font-family: 'Orbitron', 'Space Grotesk', sans-serif;
    --vote-bg: rgba(10, 8, 28, 0.62);
    --vote-border: 1px solid rgba(125, 249, 255, 0.35);
    --vote-color: #fff;
    --vote-accent: #00ffff;
    --vote-radius: 30px;
    --vote-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    --vote-blur: blur(16px);
    --vote-bar: rgba(255, 255, 255, 0.2);
  }

  @media (max-width: 720px) {
    .vote-widget {
      bottom: 96px;
      right: 14px;
    }
    .vote-pill {
      height: 38px;
    }
    .vote-widget.theme-winxp {
      bottom: 132px;
    }
  }
</style>
