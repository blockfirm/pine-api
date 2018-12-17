import { BtcdClient } from './client';
import NotificationService from './NotificationService';

const createContext = (config, globalContext) => {
  const context = {
    ...globalContext,
    btcd: new BtcdClient(config.bitcoin.btcd)
  };

  context.notifications = new NotificationService(config, context);

  return context;
};

export default createContext;
