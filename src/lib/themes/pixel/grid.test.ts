import { describe, expect, it } from 'vitest';
import { buildGrid, inBlock, MAP_H, MAP_W, walkable, zoneAt, type ZoneBlock } from './grid';

const ZONES: ZoneBlock[] = [
  { x: 8, y: 8 },
  { x: 16, y: 24 },
  { x: 24, y: 8 },
  { x: 32, y: 24 },
  { x: 36, y: 10 },
  { x: 42, y: 20 }
];

describe('buildGrid', () => {
  const grid = buildGrid(ZONES);

  it('ha le dimensioni MAP_W × MAP_H attese', () => {
    expect(grid.length).toBe(MAP_H);
    for (const row of grid) expect(row.length).toBe(MAP_W);
  });

  it('ha un bordo non camminabile (alberi) su tutti e quattro i lati', () => {
    for (let x = 0; x < MAP_W; x++) {
      expect(walkable(grid, ZONES, x, 0)).toBe(false);
      expect(walkable(grid, ZONES, x, MAP_H - 1)).toBe(false);
    }
    for (let y = 0; y < MAP_H; y++) {
      expect(walkable(grid, ZONES, 0, y)).toBe(false);
      expect(walkable(grid, ZONES, MAP_W - 1, y)).toBe(false);
    }
  });

  it('ogni zona è raggiungibile: almeno una cella dell\'anello attorno al blocco è camminabile', () => {
    for (const z of ZONES) {
      const ring: [number, number][] = [
        [z.x - 1, z.y],
        [z.x - 1, z.y + 1],
        [z.x + 2, z.y],
        [z.x + 2, z.y + 1],
        [z.x, z.y - 1],
        [z.x + 1, z.y - 1],
        [z.x, z.y + 2],
        [z.x + 1, z.y + 2]
      ];
      const reachable = ring.some(([x, y]) => walkable(grid, ZONES, x, y));
      expect(reachable).toBe(true);
    }
  });
});

describe('walkable', () => {
  const grid = buildGrid(ZONES);

  it('rifiuta i tile acqua e albero', () => {
    // Pond block sits at x:40-45, y:2-7
    expect(walkable(grid, ZONES, 41, 3)).toBe(false);
    // A hardcoded scattered tree
    expect(walkable(grid, ZONES, 4, 6)).toBe(false);
  });

  it('accetta erba e sentiero', () => {
    expect(walkable(grid, ZONES, 4, 16)).toBe(true); // road entrance
  });

  it('rifiuta le celle occupate da un edificio', () => {
    const z = ZONES[0];
    expect(walkable(grid, ZONES, z.x, z.y)).toBe(false);
    expect(walkable(grid, ZONES, z.x + 1, z.y + 1)).toBe(false);
  });

  it('rifiuta extraBlocked (es. lo scrigno segreto una volta sbloccato)', () => {
    const secret: ZoneBlock = { x: 24, y: 16 };
    expect(walkable(grid, ZONES, secret.x, secret.y)).toBe(true);
    expect(walkable(grid, ZONES, secret.x, secret.y, secret)).toBe(false);
  });

  it('rifiuta le coordinate fuori mappa', () => {
    expect(walkable(grid, ZONES, -1, 5)).toBe(false);
    expect(walkable(grid, ZONES, 5, -1)).toBe(false);
    expect(walkable(grid, ZONES, MAP_W, 5)).toBe(false);
    expect(walkable(grid, ZONES, 5, MAP_H)).toBe(false);
  });
});

describe('inBlock / zoneAt', () => {
  it('inBlock riconosce le 4 celle del blocco 2×2', () => {
    const z: ZoneBlock = { x: 10, y: 10 };
    expect(inBlock(z, 10, 10)).toBe(true);
    expect(inBlock(z, 11, 11)).toBe(true);
    expect(inBlock(z, 9, 10)).toBe(false);
    expect(inBlock(z, 12, 10)).toBe(false);
  });

  it('zoneAt trova la zona corrispondente alle coordinate', () => {
    const zones = ZONES.map((z, i) => ({ ...z, id: String(i) }));
    expect(zoneAt(zones, 8, 8)?.id).toBe('0');
    expect(zoneAt(zones, 0, 0)).toBeUndefined();
  });
});
