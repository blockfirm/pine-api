import { RedisClient } from './redis';

const createGlobalContext = (config) => {
  const context = {
    redis: new RedisClient(config.redis),
    config
  };

  return context;
};

export default createGlobalContext;
