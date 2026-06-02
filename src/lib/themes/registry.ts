import type { Component } from 'svelte';
import type { Theme } from '$lib/store';

/**
 * Lazy theme registry — each era is its own JS+CSS chunk, fetched only when its
 * era is selected. Vite caches the module promise, so re-selecting an already
 * visited era resolves instantly. This replaces the static imports that used to
 * pull all 7 themes (incl. the 64 KB PixelArt mini-game) into the page chunk.
 */
export const themeLoaders: Record<Theme, () => Promise<{ default: Component }>> = {
  terminal: () => import('./Terminal.svelte'),
  pixel: () => import('./PixelArt.svelte'),
  web1: () => import('./Web1.svelte'),
  winxp: () => import('./WinXP.svelte'),
  skeuo: () => import('./Skeuo.svelte'),
  material: () => import('./Material.svelte'),
  brutalism: () => import('./Brutalism.svelte'),
  bento: () => import('./BentoBox.svelte'),
  threed: () => import('./ThreeD.svelte')
};

/** Warm a theme's chunk ahead of selection (hover/focus on the Timeline). */
export function prefetchTheme(theme: Theme): void {
  void themeLoaders[theme]?.();
}
