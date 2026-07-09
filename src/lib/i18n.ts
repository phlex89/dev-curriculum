import { get, writable } from 'svelte/store';
import { cvData } from './cv-data';
import { cvDataEn, ui, type UiStrings } from './translations';

export type Lang = 'it' | 'en';

const LANGS: Lang[] = ['it', 'en'];
const isLang = (v: string | null | undefined): v is Lang => !!v && LANGS.includes(v as Lang);

const persist = (l: Lang) => {
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem('cv_lang', l);
    } catch {
      /* storage blocked */
    }
  }
};

const reflectDocumentLang = (l: Lang) => {
  if (typeof document !== 'undefined') document.documentElement.lang = l;
};

/** Reflect the language in the URL (`?lang=en`) so the full state — era hash +
 *  language — is shareable as a single link. Always `replace`: the language is
 *  a view preference, not a navigation step for the Back button. */
const writeQuery = (l: Lang) => {
  if (typeof location === 'undefined') return;
  try {
    const url = new URL(location.href);
    if (url.searchParams.get('lang') === l) return;
    url.searchParams.set('lang', l);
    history.replaceState(history.state, '', url);
  } catch {
    /* history blocked */
  }
};

const readQuery = (): Lang | null => {
  if (typeof location === 'undefined') return null;
  try {
    const q = new URLSearchParams(location.search).get('lang');
    return isLang(q) ? q : null;
  } catch {
    return null;
  }
};

const createLangStore = () => {
  const { subscribe, set: _set } = writable<Lang>('it');

  return {
    subscribe,
    set: (l: Lang) => {
      persist(l);
      writeQuery(l);
      reflectDocumentLang(l);
      _set(l);
    },
    /** Deep-link (`?lang=`) wins over the saved preference, which wins over the
     *  browser language. The resolved value is reflected back into the URL so
     *  the address is always shareable. */
    init: () => {
      let resolved: Lang | null = readQuery();
      if (!resolved && typeof localStorage !== 'undefined') {
        try {
          const saved = localStorage.getItem('cv_lang');
          if (isLang(saved)) resolved = saved;
        } catch {
          /* ignore */
        }
      }
      if (!resolved && typeof navigator !== 'undefined') {
        resolved = (navigator.language || '').toLowerCase().startsWith('it') ? 'it' : 'en';
      }
      const l = resolved ?? 'it';
      persist(l);
      writeQuery(l);
      reflectDocumentLang(l);
      _set(l);
    }
  };
};

export const lang = createLangStore();

export const getLang = (): Lang => get(lang);

/** Language-resolved CV data. The eras are remounted on every language switch
 *  (`{#key}` in +page.svelte), so reading it once at component init is enough. */
export const getCvData = (): typeof cvData => (getLang() === 'en' ? cvDataEn : cvData);

/** Language-resolved UI chrome strings (per-era labels, dialogs, aria text). */
export const getUi = (): UiStrings => ui[getLang()];
