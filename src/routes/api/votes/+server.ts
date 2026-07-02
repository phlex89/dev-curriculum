import { json } from '@sveltejs/kit';
import { Redis } from '@upstash/redis';
import { env } from '$env/dynamic/private';
import { allowRequest, applyVote, isEra, readVotes } from '$lib/server/votes-core';
import type { RequestHandler } from './$types';

const getRedis = () =>
  env.KV_REST_API_URL && env.KV_REST_API_TOKEN
    ? new Redis({ url: env.KV_REST_API_URL, token: env.KV_REST_API_TOKEN })
    : null;

export const GET: RequestHandler = async () => {
  const redis = getRedis();
  if (!redis) return json({ error: 'unavailable' }, { status: 503 });
  try {
    return json({ votes: await readVotes(redis) });
  } catch {
    return json({ error: 'unavailable' }, { status: 503 });
  }
};

export const POST: RequestHandler = async (event) => {
  const redis = getRedis();
  if (!redis) return json({ error: 'unavailable' }, { status: 503 });
  let body: unknown;
  try {
    body = await event.request.json();
  } catch {
    return json({ error: 'bad request' }, { status: 400 });
  }
  const { era, action } = (body ?? {}) as { era?: unknown; action?: unknown };
  if (!isEra(era) || (action !== 'like' && action !== 'unlike')) {
    return json({ error: 'bad request' }, { status: 400 });
  }
  try {
    if (!(await allowRequest(redis, event.getClientAddress()))) {
      return json({ error: 'rate limited' }, { status: 429 });
    }
    await applyVote(redis, era, action);
    return json({ votes: await readVotes(redis) });
  } catch {
    return json({ error: 'unavailable' }, { status: 503 });
  }
};
