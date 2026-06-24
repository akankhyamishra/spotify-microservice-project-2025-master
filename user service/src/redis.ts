// ioredis v5 has namespace/type issues with NodeNext — use dynamic import + any cast
/* eslint-disable @typescript-eslint/no-explicit-any */
let _client: any = null;

async function getRedis(): Promise<any> {
  if (!process.env.REDIS_URL) return null;
  if (_client) return _client;
  const mod = await import("ioredis");
  const RedisClass: any = mod.Redis ?? (mod as any).default;
  _client = new RedisClass(process.env.REDIS_URL, { lazyConnect: true, enableOfflineQueue: false });
  _client.on("error", () => {});
  return _client;
}

export async function cacheGet(key: string): Promise<string | null> {
  try { const r = await getRedis(); return r ? await r.get(key) : null; } catch { return null; }
}

export async function cacheSet(key: string, value: string, ttlSeconds = 300): Promise<void> {
  try { const r = await getRedis(); if (r) await r.set(key, value, "EX", ttlSeconds); } catch {}
}

export async function cacheDel(key: string): Promise<void> {
  try { const r = await getRedis(); if (r) await r.del(key); } catch {}
}
