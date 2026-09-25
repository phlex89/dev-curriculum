// Konami code (↑↑↓↓←→←→ B A). Fed from BOTH the keyboard and the touch pad,
// so the easter egg is reachable on mobile (D-pad directions + B + A).
export const KONAMI_SEQUENCE = [
  'arrowup',
  'arrowup',
  'arrowdown',
  'arrowdown',
  'arrowleft',
  'arrowright',
  'arrowleft',
  'arrowright',
  'b',
  'a'
] as const;

export interface KonamiState {
  buffer: readonly string[];
}

export function createKonamiState(): KonamiState {
  return { buffer: [] };
}

export interface KonamiFeedResult {
  state: KonamiState;
  completed: boolean;
}

export function feedKonami(
  state: KonamiState,
  token: string,
  sequence: readonly string[] = KONAMI_SEQUENCE
): KonamiFeedResult {
  let buffer = [...state.buffer, token];
  if (buffer.length > sequence.length) buffer = buffer.slice(buffer.length - sequence.length);
  const completed = buffer.length === sequence.length && buffer.every((v, i) => v === sequence[i]);
  return { state: { buffer: completed ? [] : buffer }, completed };
}
