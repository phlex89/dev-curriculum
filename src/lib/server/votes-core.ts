import { ERA_ORDER, type Theme } from '../store';

export interface VoteRedis {
  hincrby(key: string, field: string, increment: number): Promise<number>;
  hset(key: string, values: Record<string, number>): Promise<number>;
  hgetall<T extends Record<string, unknown>>(key: string): Promise<T | null>;
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
}

export const VOTES_KEY = 'era_votes';

export const isEra = (v: unknown): v is Theme =>
  typeof v === 'string' && (ERA_ORDER as string[]).includes(v);

export async function readVotes(redis: VoteRedis): Promise<Record<Theme, number>> {
  const raw = (await redis.hgetall<Record<string, unknown>>(VOTES_KEY)) ?? {};
  const votes = {} as Record<Theme, number>;
  for (const era of ERA_ORDER) votes[era] = Number(raw[era] ?? 0) || 0;
  return votes;
}

export async function applyVote(redis: VoteRedis, era: Theme, action: 'like' | 'unlike'): Promise<void> {
  const next = await redis.hincrby(VOTES_KEY, era, action === 'like' ? 1 : -1);
  if (next < 0) await redis.hset(VOTES_KEY, { [era]: 0 });
}

export async function allowRequest(redis: VoteRedis, ip: string, limit = 20): Promise<boolean> {
  const key = `rl:${ip}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, 60);
  return count <= limit;
}
