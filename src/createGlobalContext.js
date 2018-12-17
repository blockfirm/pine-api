import { ApnClient } from './apn';
import { RedisClient } from './redis';

const createGlobalContext = (config) => {
  const context = {
    apn: new ApnClient(config.apn),
    redis: new RedisClient(config.redis),
    config
  };

  return context;
};

export default createGlobalContext;
