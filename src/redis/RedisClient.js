import redis from 'redis';

export default class RedisClient {
  constructor(config) {
    this.config = config;
    this._connect();
  }

  _connect() {
    this.client = redis.createClient(
      this.config.port,
      this.config.host,
      {
        // eslint-disable-next-line camelcase
        retry_strategy: () => 2000 // Try to reconnect after 2 seconds.
      }
    );

    this.client.on('connect', () => {
      console.log('[REDIS] ✅ Connected');
    });

    this.client.on('reconnecting', () => {
      console.log('[REDIS] ♻️  Reconnecting...');
    });

    this.client.on('error', (error) => {
      console.error('[REDIS] 🔥 Error: ', error.message);
    });
  }

  get(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      });
    });
  }

  set(key, value) {
    return new Promise((resolve, reject) => {
      this.client.set(key, value, (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      });
    });
  }

  sadd(key, values) {
    return new Promise((resolve, reject) => {
      this.client.sadd(key, values, (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      });
    });
  }
}
