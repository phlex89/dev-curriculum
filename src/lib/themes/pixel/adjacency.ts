export interface ZoneBlock {
  x: number;
  y: number;
}

export interface HeroPos {
  x: number;
  y: number;
}

// Hero is orthogonally adjacent to a block's ring (not diagonally, not inside).
export function isAdjacentToBlock(hero: HeroPos, z: ZoneBlock): boolean {
  const inX = hero.x >= z.x && hero.x <= z.x + 1;
  const inY = hero.y >= z.y && hero.y <= z.y + 1;
  return (inY && (hero.x === z.x - 1 || hero.x === z.x + 2)) || (inX && (hero.y === z.y - 1 || hero.y === z.y + 2));
}

export function adjacentZoneIds<T extends ZoneBlock & { id: string }>(hero: HeroPos, zones: readonly T[]): string[] {
  return zones.filter((z) => isAdjacentToBlock(hero, z)).map((z) => z.id);
}

export interface AdjacencyUpdate {
  now: string[];
  fresh: string | undefined;
}

// Trigger on the not-adjacent → adjacent transition only.
export function updateAdjacency<T extends ZoneBlock & { id: string }>(
  hero: HeroPos,
  zones: readonly T[],
  prevAdjacent: readonly string[]
): AdjacencyUpdate {
  const now = adjacentZoneIds(hero, zones);
  const fresh = now.find((id) => !prevAdjacent.includes(id));
  return { now, fresh };
}
