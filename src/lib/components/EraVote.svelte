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

  @media (max-width: 720px) {
    .vote-widget {
      bottom: 96px;
      right: 14px;
    }
    .vote-pill {
      height: 38px;
    }
  }
</style>
