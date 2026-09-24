import { describe, expect, it } from 'vitest';
import { createKonamiState, feedKonami, KONAMI_SEQUENCE, type KonamiState } from './konami';

function feedAll(tokens: readonly string[]): { state: KonamiState; completed: boolean[] } {
  let state = createKonamiState();
  const completed: boolean[] = [];
  for (const token of tokens) {
    const result = feedKonami(state, token);
    state = result.state;
    completed.push(result.completed);
  }
  return { state, completed };
}

describe('feedKonami', () => {
  it('sblocca inserendo la sequenza completa ↑↑↓↓←→←→ B A', () => {
    const { completed } = feedAll(KONAMI_SEQUENCE);
    expect(completed.at(-1)).toBe(true);
    expect(completed.slice(0, -1).every((c) => c === false)).toBe(true);
  });

  it('svuota il buffer subito dopo lo sblocco', () => {
    const { state } = feedAll(KONAMI_SEQUENCE);
    expect(state.buffer).toEqual([]);
  });

  it('non sblocca con una sequenza sbagliata', () => {
    const { completed } = feedAll(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']);
    expect(completed.every((c) => c === false)).toBe(true);
  });

  it('non sblocca con una sequenza incompleta', () => {
    const { completed } = feedAll(KONAMI_SEQUENCE.slice(0, -1));
    expect(completed.every((c) => c === false)).toBe(true);
  });

  it('sblocca comunque dopo una ripartenza a metà (es. ↑ ripetuto in testa)', () => {
    const tokens = ['arrowup', 'arrowup', 'arrowup', ...KONAMI_SEQUENCE.slice(1)];
    const { completed } = feedAll(tokens);
    expect(completed.at(-1)).toBe(true);
  });

  it('una sequenza sbagliata seguita da quella giusta si sblocca comunque (la finestra scorre)', () => {
    const tokens = ['x', 'y', 'z', ...KONAMI_SEQUENCE];
    const { completed } = feedAll(tokens);
    expect(completed.at(-1)).toBe(true);
  });
});
