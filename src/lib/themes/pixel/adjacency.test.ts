import { describe, expect, it } from 'vitest';
import { adjacentZoneIds, isAdjacentToBlock, updateAdjacency, type ZoneBlock } from './adjacency';

const ZONE: ZoneBlock = { x: 10, y: 10 };

describe('isAdjacentToBlock', () => {
  it('è vero direttamente a sinistra del blocco', () => {
    expect(isAdjacentToBlock({ x: 9, y: 10 }, ZONE)).toBe(true);
    expect(isAdjacentToBlock({ x: 9, y: 11 }, ZONE)).toBe(true);
  });

  it('è vero direttamente a destra del blocco', () => {
    expect(isAdjacentToBlock({ x: 12, y: 10 }, ZONE)).toBe(true);
  });

  it('è vero sopra e sotto il blocco', () => {
    expect(isAdjacentToBlock({ x: 10, y: 9 }, ZONE)).toBe(true);
    expect(isAdjacentToBlock({ x: 11, y: 12 }, ZONE)).toBe(true);
  });

  it('è falso in diagonale (non ortogonale)', () => {
    expect(isAdjacentToBlock({ x: 9, y: 9 }, ZONE)).toBe(false);
    expect(isAdjacentToBlock({ x: 12, y: 12 }, ZONE)).toBe(false);
  });

  it('è falso dentro il blocco stesso', () => {
    expect(isAdjacentToBlock({ x: 10, y: 10 }, ZONE)).toBe(false);
    expect(isAdjacentToBlock({ x: 11, y: 11 }, ZONE)).toBe(false);
  });

  it('è falso lontano dal blocco', () => {
    expect(isAdjacentToBlock({ x: 0, y: 0 }, ZONE)).toBe(false);
  });
});

describe('adjacentZoneIds', () => {
  const zones = [
    { id: 'a', x: 10, y: 10 },
    { id: 'b', x: 20, y: 20 }
  ];

  it('elenca solo le zone effettivamente adiacenti', () => {
    expect(adjacentZoneIds({ x: 9, y: 10 }, zones)).toEqual(['a']);
    expect(adjacentZoneIds({ x: 0, y: 0 }, zones)).toEqual([]);
  });
});

describe('updateAdjacency', () => {
  const zones = [
    { id: 'a', x: 10, y: 10 },
    { id: 'b', x: 20, y: 20 }
  ];

  it('segnala fresh alla prima transizione non-adiacente → adiacente', () => {
    const result = updateAdjacency({ x: 9, y: 10 }, zones, []);
    expect(result.now).toEqual(['a']);
    expect(result.fresh).toBe('a');
  });

  it('non ri-segnala fresh se si resta adiacenti alla stessa zona', () => {
    const result = updateAdjacency({ x: 9, y: 10 }, zones, ['a']);
    expect(result.now).toEqual(['a']);
    expect(result.fresh).toBeUndefined();
  });

  it('segnala fresh di nuovo dopo essersi allontanati e essere tornati', () => {
    const away = updateAdjacency({ x: 0, y: 0 }, zones, ['a']);
    expect(away.now).toEqual([]);
    const back = updateAdjacency({ x: 9, y: 10 }, zones, away.now);
    expect(back.fresh).toBe('a');
  });
});
