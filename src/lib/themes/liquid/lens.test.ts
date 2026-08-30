import { describe, expect, it } from 'vitest';
import { buildDisplacementMap, roundedRectSdf, supportsBackdropLens } from './lens';

describe('roundedRectSdf', () => {
  it('è negativa al centro', () => {
    expect(roundedRectSdf(0, 0, 50, 20, 10)).toBeLessThan(0);
  });

  it('è positiva fuori dal rettangolo', () => {
    expect(roundedRectSdf(80, 0, 50, 20, 10)).toBeGreaterThan(0);
  });

  it('è circa zero sul bordo', () => {
    expect(Math.abs(roundedRectSdf(50, 0, 50, 20, 10))).toBeLessThan(0.001);
  });
});

describe('buildDisplacementMap', () => {
  const w = 64;
  const h = 32;
  const map = buildDisplacementMap({ width: w, height: h, radius: 8, strength: 1 });

  const px = (x: number, y: number) => {
    const i = (y * w + x) * 4;
    return { r: map[i], g: map[i + 1], b: map[i + 2], a: map[i + 3] };
  };

  it('produce un buffer RGBA della dimensione attesa', () => {
    expect(map.length).toBe(w * h * 4);
  });

  it('è neutra al centro (nessuno spostamento)', () => {
    const c = px(w / 2, h / 2);
    expect(c.r).toBe(128);
    expect(c.g).toBe(128);
  });

  it('si discosta dal neutro vicino al bordo', () => {
    const edge = px(1, h / 2);
    expect(Math.abs(edge.r - 128)).toBeGreaterThan(4);
  });

  it('spinge in direzioni opposte sui due bordi orizzontali', () => {
    const left = px(1, h / 2).r - 128;
    const right = px(w - 2, h / 2).r - 128;
    expect(Math.sign(left)).toBe(-Math.sign(right));
  });

  it('è completamente opaca', () => {
    expect(px(0, 0).a).toBe(255);
    expect(px(w / 2, h / 2).a).toBe(255);
  });
});

describe('supportsBackdropLens', () => {
  const yes = () => true;
  const no = () => false;

  it('esclude WebKit (Safari e ogni browser su iOS)', () => {
    expect(supportsBackdropLens({ vendor: 'Apple Computer, Inc.', supports: no })).toBe(false);
  });

  it('esclude Gecko', () => {
    const supports = (prop: string) => prop === '-moz-appearance';
    expect(supportsBackdropLens({ vendor: '', supports })).toBe(false);
  });

  it('abilita la lente su Chromium', () => {
    expect(supportsBackdropLens({ vendor: 'Google Inc.', supports: no })).toBe(true);
  });

  it('in caso di dubbio degrada al fallback', () => {
    expect(supportsBackdropLens({ vendor: '', supports: yes })).toBe(false);
  });
});
