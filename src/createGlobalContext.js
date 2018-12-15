import redis from 'redis';

const createGlobalContext = (config) => {
  const redisClient = redis.createClient(
    config.redis.port,
    config.redis.host,
    {
      // eslint-disable-next-line camelcase
      retry_strategy: () => 2000 // Try to reconnect after 2 seconds.
    }
  );

  redisClient.on('connect', () => {
    console.log('[REDIS] ✅ Connected');
  });

  redisClient.on('reconnecting', () => {
    console.log('[REDIS] ♻️  Reconnecting...');
  });

  redisClient.on('error', (error) => {
    console.error('[REDIS] 🔥 Error: ', error.message);
  });

  const context = {
    redis: redisClient,
    config
  };

  return context;
};

export default createGlobalContext;
