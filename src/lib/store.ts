import { writable } from 'svelte/store';

export type Theme = 'bento' | 'winxp' | 'terminal' | 'threed' | 'skeuo' | 'material' | 'brutalism' | 'pixel' | 'web1' | 'glass';

/** Valid themes (used to validate persisted / deep-linked values). */
const THEMES: Theme[] = ['bento', 'winxp', 'terminal', 'threed', 'skeuo', 'material', 'brutalism', 'pixel', 'web1', 'glass'];

/** Chronological order of the eras — drives the directional time-travel transition.
 *  Pixel Art (console 8-bit) is a parallel lineage contemporary to the Terminal,
 *  so it sits right after it. Web 1.0 (mid-'90s GeoCities/Netscape) bridges the
 *  gap between the console/terminal age and the Windows XP desktop. Glassmorphism
 *  (the luminous Big Sur / Windows 11 present) sits between Bento and the 3D future. */
export const ERA_ORDER: Theme[] = ['terminal', 'pixel', 'web1', 'winxp', 'skeuo', 'material', 'brutalism', 'bento', 'glass', 'threed'];

const isTheme = (v: string | null | undefined): v is Theme => !!v && THEMES.includes(v as Theme);

const persist = (theme: Theme) => {
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem('cv_theme', theme);
    } catch {
      /* storage blocked */
    }
  }
};

/** Reflect the active era in the URL hash so a recruiter can share e.g. `#winxp`. */
const syncHash = (theme: Theme) => {
  if (typeof location !== 'undefined' && location.hash.slice(1) !== theme) {
    try {
      history.replaceState(history.state, '', `#${theme}`);
    } catch {
      /* history blocked */
    }
  }
};

const createThemeStore = () => {
  const { subscribe, set: _set } = writable<Theme>('bento');

  return {
    subscribe,
    /** User-initiated change: persist + reflect in the URL. */
    set: (theme: Theme) => {
      persist(theme);
      syncHash(theme);
      _set(theme);
    },
    /** Change coming from the URL itself (hashchange / back-forward): don't rewrite the hash. */
    setFromHash: (theme: Theme) => {
      persist(theme);
      _set(theme);
    },
    init: () => {
      // A deep-link wins over the stored preference.
      if (typeof location !== 'undefined' && isTheme(location.hash.slice(1))) {
        const t = location.hash.slice(1) as Theme;
        persist(t);
        _set(t);
        return;
      }
      if (typeof localStorage !== 'undefined') {
        let saved: string | null = null;
        try {
          saved = localStorage.getItem('cv_theme');
        } catch {
          /* ignore */
        }
        if (isTheme(saved)) {
          _set(saved);
          syncHash(saved);
          return;
        }
      }
      // Default era — reflect it in the hash so the URL is always shareable.
      syncHash('bento');
    }
  };
};

export const currentTheme = createThemeStore();
