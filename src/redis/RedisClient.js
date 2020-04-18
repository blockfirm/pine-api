/* eslint-disable max-lines */
import redis from 'redis';
import logger from '../logger';

const RECONNECT_INTERVAL = 2000;

export default class RedisClient {
  constructor(config) {
    this.config = config;
    this.logger = logger.child({ scope: 'RedisClient' });

    try {
      this._connect();
    } catch (error) {
      this.logger.error(`Unable to connect to redis: ${error.message}`);
    }
  }

  _connect() {
    const config = this.config;

    if (!config || !config.enabled || !config.host) {
      return this.logger.warn('Cannot connect to redis, missing configuration');
    }

    this.client = redis.createClient(
      config.port,
      config.host,
      {
        // eslint-disable-next-line camelcase
        retry_strategy: () => RECONNECT_INTERVAL // Try to reconnect after 2 seconds.
      }
    );

    this.client.on('connect', () => {
      this.logger.info(`Connected to redis at ${config.host}:${config.port}`);
    });

    this.client.on('reconnecting', () => {
      this.logger.warn('Reconnecting to redis...');
    });

    this.client.on('error', (error) => {
      this.logger.error(`Redis error: ${error.message}`);
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

  del(key) {
    return new Promise((resolve, reject) => {
      this.client.del(key, (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      });
    });
  }

  expire(key, seconds) {
    return new Promise((resolve, reject) => {
      this.client.expire(key, seconds, (error, result) => {
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

  srem(key, value) {
    return new Promise((resolve, reject) => {
      this.client.srem(key, value, (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      });
    });
  }

  smembers(key) {
    return new Promise((resolve, reject) => {
      this.client.smembers(key, (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      });
    });
  }

  scard(key) {
    return new Promise((resolve, reject) => {
      this.client.scard(key, (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      });
    });
  }

  keys(pattern) {
    return new Promise((resolve, reject) => {
      this.client.keys(pattern, (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      });
    });
  }
}
