const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');

exports.acquireIdempotencyLock = async (req, res, next) => {
  const idempotencyKey = req.headers['x-idempotency-key'];
  if (!idempotencyKey) {
    return res.status(400).json({ error: 'Missing x-idempotency-key header' });
  }

  const redisKey = `lock:${req.tenantId}:${idempotencyKey}`;

  // Check if already processed and cached
  const cachedResponse = await redis.get(`res:${redisKey}`);
  if (cachedResponse) {
    return res.status(200).json({ ...JSON.parse(cachedResponse), cached: true });
  }

  // Acquire atomic distributed lock (SET NX with 30s TTL)
  const acquired = await redis.set(redisKey, 'LOCKED', 'NX', 'EX', 30);
  if (!acquired) {
    return res.status(409).json({ error: 'Transaction currently in flight. Duplicate blocked.' });
  }

  req.idempotencyKey = idempotencyKey;
  req.redisLockKey = redisKey;
  req.redis = redis;
  next();
};
