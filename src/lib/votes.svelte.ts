import { ERA_ORDER, type Theme } from './store';
import { trackEvent } from './analytics';

const STORAGE_KEY = 'cv_votes';

export const votesState = $state({
  liked: [] as Theme[],
  totals: null as Record<Theme, number> | null,
  totalsFailed: false
});

const readLiked = (): Theme[] => {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(raw) ? raw.filter((v): v is Theme => (ERA_ORDER as string[]).includes(v)) : [];
  } catch {
    return [];
  }
};

const persistLiked = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(votesState.liked));
  } catch {
    /* storage bloccato: il toggle resta in memoria per la sessione */
  }
};

export const initVotes = () => {
  votesState.liked = readLiked();
};

export async function loadTotals(): Promise<void> {
  try {
    const res = await fetch('/api/votes');
    if (res.ok) {
      votesState.totals = (await res.json()).votes;
      votesState.totalsFailed = false;
    } else {
      votesState.totalsFailed = true;
    }
  } catch {
    votesState.totalsFailed = true;
  }
}

export async function toggleVote(era: Theme): Promise<void> {
  const action = votesState.liked.includes(era) ? 'unlike' : 'like';
  votesState.liked =
    action === 'like' ? [...votesState.liked, era] : votesState.liked.filter((e) => e !== era);
  persistLiked();
  if (votesState.totals) {
    votesState.totals[era] = Math.max(0, (votesState.totals[era] ?? 0) + (action === 'like' ? 1 : -1));
  }
  if (action === 'like') trackEvent(`vote-${era}`);
  try {
    const res = await fetch('/api/votes', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ era, action })
    });
    if (res.ok) votesState.totals = (await res.json()).votes;
  } catch {
    /* il voto non deve mai rompere l'app */
  }
}
