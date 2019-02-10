import { BtcdClient } from './btcd';
import { RedisClient } from './redis';
import NotificationService from './NotificationService';
import FiatRateService from './FiatRateService';

const createContext = (config) => {
  const context = {
    btcd: new BtcdClient(config.bitcoin.btcd),
    redis: new RedisClient(config.redis),
    config
  };

  context.notifications = new NotificationService(config, context);
  context.fiatRates = new FiatRateService(config.fiatRates, context);

  return context;
};

export default createContext;
