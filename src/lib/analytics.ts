/** Microsoft Clarity helpers. The tag itself is loaded from src/app.html (production
 *  hosts only); here we only enrich the session so recordings/heatmaps can be
 *  filtered by the era actually on screen. */

type Clarity = (...args: unknown[]) => void;

const clarity = (): Clarity | undefined =>
  typeof window !== 'undefined' ? (window as { clarity?: Clarity }).clarity : undefined;

/** Named event (low-cardinality name, e.g. `pixel-quest-complete`): shows up in
 *  Clarity as a smart event, usable in funnels and filters. */
export const trackEvent = (name: string) => {
  const c = clarity();
  if (!c) return;
  try {
    c('event', name);
  } catch {
    /* analytics must never break the app */
  }
};

/** Custom tag: key/value attached to the session, for variable values (visited
 *  teletext page, typed terminal command…) that would explode as event names. */
export const trackTag = (key: string, value: string) => {
  const c = clarity();
  if (!c) return;
  try {
    c('set', key, value);
  } catch {
    /* analytics must never break the app */
  }
};

/** Tag the session with the era on screen: a custom tag (`era`) for filtering,
 *  plus a named event (`era-<theme>`) so each visit shows up as a smart event. */
export const trackEra = (era: string) => {
  trackTag('era', era);
  trackEvent(`era-${era}`);
};
