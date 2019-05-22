import { BtcdClient } from './btcd';
import { RedisClient } from './redis';
import FiatRateService from './FiatRateService';

const createContext = (config) => {
  const context = {
    btcd: new BtcdClient(config.bitcoin.btcd),
    redis: new RedisClient(config.redis),
    config
  };

  context.fiatRates = new FiatRateService(config.fiatRates, context);

  return context;
};

export default createContext;
