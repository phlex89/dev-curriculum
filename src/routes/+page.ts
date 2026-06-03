// Prerender this route to static HTML so crawlers (and no-JS clients) receive the
// full CV. The eleven interactive eras still hydrate and run client-side as usual;
// the always-mounted <SeoContent> block (see +page.svelte) is what gets baked into
// the prerendered markup. SSR is on by default and the page is SSR-safe (every
// window/location/localStorage access is guarded by typeof or lives in onMount).
export const prerender = true;
