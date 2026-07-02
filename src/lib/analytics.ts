/** Microsoft Clarity helpers. The tag itself is loaded from src/app.html (production
 *  hosts only); here we only enrich the session so recordings/heatmaps can be
 *  filtered by the era actually on screen. */

type Clarity = (...args: unknown[]) => void;

const clarity = (): Clarity | undefined =>
  typeof window !== 'undefined' ? (window as { clarity?: Clarity }).clarity : undefined;

/** Tag the session with the era on screen: a custom tag (`era`) for filtering,
 *  plus a named event (`era-<theme>`) so each visit shows up as a smart event. */
export const trackEra = (era: string) => {
  const c = clarity();
  if (!c) return;
  try {
    c('set', 'era', era);
    c('event', `era-${era}`);
  } catch {
    /* analytics must never break the app */
  }
};
