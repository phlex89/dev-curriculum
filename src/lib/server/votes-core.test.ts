import { describe, expect, it } from 'vitest';
import { ERA_ORDER } from '../store';
import { allowRequest, applyVote, isEra, readVotes, VOTES_KEY, type VoteRedis } from './votes-core';

const fakeRedis = () => {
  const hashes: Record<string, Record<string, number>> = {};
  const counters: Record<string, number> = {};
  const ttls: Record<string, number> = {};
  const redis: VoteRedis = {
    async hincrby(key, field, increment) {
      const h = (hashes[key] ??= {});
      h[field] = (h[field] ?? 0) + increment;
      return h[field];
    },
    async hset(key, values) {
      Object.assign((hashes[key] ??= {}), values);
      return Object.keys(values).length;
    },
    async hgetall<T extends Record<string, unknown>>(key: string) {
      return (hashes[key] as T) ?? null;
    },
    async incr(key) {
      counters[key] = (counters[key] ?? 0) + 1;
      return counters[key];
    },
    async expire(key, seconds) {
      ttls[key] = seconds;
      return 1;
    }
  };
  return { redis, hashes, counters, ttls };
};

describe('isEra', () => {
  it('accetta ogni era di ERA_ORDER', () => {
    for (const era of ERA_ORDER) expect(isEra(era)).toBe(true);
  });

  it('rifiuta valori non validi', () => {
    expect(isEra('foo')).toBe(false);
    expect(isEra('')).toBe(false);
    expect(isEra(undefined)).toBe(false);
    expect(isEra(42)).toBe(false);
  });
});

describe('readVotes', () => {
  it('restituisce 0 per tutte le ere quando lo hash non esiste', async () => {
    const { redis } = fakeRedis();
    const votes = await readVotes(redis);
    expect(Object.keys(votes).sort()).toEqual([...ERA_ORDER].sort());
    for (const era of ERA_ORDER) expect(votes[era]).toBe(0);
  });

  it('legge i contatori esistenti e coercizza le stringhe', async () => {
    const { redis, hashes } = fakeRedis();
    hashes[VOTES_KEY] = { pixel: 7, terminal: '3' as unknown as number };
    const votes = await readVotes(redis);
    expect(votes.pixel).toBe(7);
    expect(votes.terminal).toBe(3);
    expect(votes.glass).toBe(0);
  });
});

describe('applyVote', () => {
  it('like incrementa il contatore', async () => {
    const { redis, hashes } = fakeRedis();
    await applyVote(redis, 'pixel', 'like');
    await applyVote(redis, 'pixel', 'like');
    expect(hashes[VOTES_KEY].pixel).toBe(2);
  });

  it('unlike decrementa il contatore', async () => {
    const { redis, hashes } = fakeRedis();
    hashes[VOTES_KEY] = { pixel: 5 };
    await applyVote(redis, 'pixel', 'unlike');
    expect(hashes[VOTES_KEY].pixel).toBe(4);
  });

  it('unlike su contatore a 0 non scende sotto zero', async () => {
    const { redis, hashes } = fakeRedis();
    await applyVote(redis, 'pixel', 'unlike');
    expect(hashes[VOTES_KEY].pixel).toBe(0);
  });
});

describe('allowRequest', () => {
  it('consente le richieste entro il limite e imposta la scadenza', async () => {
    const { redis, ttls } = fakeRedis();
    expect(await allowRequest(redis, '1.2.3.4')).toBe(true);
    expect(ttls['rl:1.2.3.4']).toBe(60);
  });

  it('blocca oltre il limite', async () => {
    const { redis } = fakeRedis();
    for (let i = 0; i < 20; i++) expect(await allowRequest(redis, '1.2.3.4')).toBe(true);
    expect(await allowRequest(redis, '1.2.3.4')).toBe(false);
  });

  it('il limite è per IP', async () => {
    const { redis } = fakeRedis();
    for (let i = 0; i < 20; i++) await allowRequest(redis, '1.2.3.4');
    expect(await allowRequest(redis, '5.6.7.8')).toBe(true);
  });
});
