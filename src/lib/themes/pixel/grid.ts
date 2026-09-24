export type Tile = 'grass' | 'grass2' | 'path' | 'water' | 'tree' | 'flower';

export interface ZoneBlock {
  x: number;
  y: number;
}

export const MAP_W = 48;
export const MAP_H = 32;

const BLOCKED: Tile[] = ['water', 'tree'];

export function buildGrid(zones: readonly ZoneBlock[]): Tile[][] {
  const g: Tile[][] = [];
  for (let y = 0; y < MAP_H; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < MAP_W; x++) {
      const border = x <= 1 || y <= 1 || x >= MAP_W - 2 || y >= MAP_H - 2;
      row.push(border ? 'tree' : (x + y) % 2 === 0 ? 'grass' : 'grass2');
    }
    g.push(row);
  }
  const set = (x: number, y: number, t: Tile) => {
    if (x > 1 && y > 1 && x < MAP_W - 2 && y < MAP_H - 2) g[y][x] = t;
  };

  // ── Winding road: a single continuous serpentine left→right, passing the
  //    approach block of each zone in order. Drawn segment-by-segment between
  //    corner waypoints (each shares its turning tile with the next); every
  //    segment is brushed 2 tiles wide so corners close on themselves.
  const road: [number, number][] = [
    [4, 16], // entrance (hero spawn)
    [8, 16], // ┐
    [8, 10], // ┘ pass below CASA (8,8)
    [12, 10], // ┐
    [12, 22], // ┘ descend
    [16, 22], // pass above CASTELLO (16,24)
    [20, 22], // ┐
    [20, 10], // ┘ climb
    [24, 10], // pass below BOTTEGA (24,8)
    [28, 10], // ┐
    [28, 22], // ┘ descend
    [32, 22], // pass above BIBLIOTECA (32,24)
    [36, 22], // ┐
    [36, 12], // ┘ climb
    [38, 12], // pass below POSTA (36,10)
    [38, 18], // ┐
    [42, 18] // ┘ reach above SCRIGNO (42,20)
  ];
  for (let i = 0; i < road.length - 1; i++) {
    const [x1, y1] = road[i];
    const [x2, y2] = road[i + 1];
    if (x1 === x2) {
      for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
        set(x1, y, 'path');
        set(x1 + 1, y, 'path');
      }
    } else {
      for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
        set(x, y1, 'path');
        set(x, y1 + 1, 'path');
      }
    }
  }

  // Decorative pond (top-right corner, clear of the road and the POSTA sign)
  for (let y = 2; y <= 7; y++) for (let x = 40; x <= 45; x++) set(x, y, 'water');
  // Scattered trees (all off-road, framing the scene)
  for (const [x, y] of [
    [4, 6], [4, 10], [4, 22], [14, 4], [20, 4], [26, 4], [32, 4],
    [44, 10], [44, 16], [44, 24], [16, 6], [22, 16], [30, 16], [34, 16],
    [8, 26], [18, 26], [26, 26], [10, 26]
  ])
    set(x, y, 'tree');
  // Flowers (walkable flavour, dotted along the road)
  for (const [x, y] of [[10, 8], [22, 8], [34, 10], [14, 24], [30, 24], [40, 16], [6, 18]]) set(x, y, 'flower');
  // Plaza under each building (2×2 block, corner at z.x/z.y)
  for (const z of zones) {
    set(z.x, z.y, 'path');
    set(z.x + 1, z.y, 'path');
    set(z.x, z.y + 1, 'path');
    set(z.x + 1, z.y + 1, 'path');
  }
  return g;
}

// Every zone/shrine occupies a 2×2 block anchored at (z.x, z.y).
export function inBlock(z: ZoneBlock, x: number, y: number): boolean {
  return x >= z.x && x <= z.x + 1 && y >= z.y && y <= z.y + 1;
}

export function zoneAt<T extends ZoneBlock>(zones: readonly T[], x: number, y: number): T | undefined {
  return zones.find((z) => inBlock(z, x, y));
}

export function walkable(
  grid: readonly Tile[][],
  zones: readonly ZoneBlock[],
  x: number,
  y: number,
  extraBlocked?: ZoneBlock
): boolean {
  if (x < 0 || y < 0 || y >= grid.length || x >= grid[0].length) return false;
  if (BLOCKED.includes(grid[y][x])) return false;
  if (zoneAt(zones, x, y)) return false; // buildings are solid
  if (extraBlocked && inBlock(extraBlocked, x, y)) return false; // e.g. the shrine, once unlocked
  return true;
}
