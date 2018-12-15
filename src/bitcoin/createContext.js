import { BtcdClient } from './client';

const createContext = (config, globalContext) => {
  const context = {
    ...globalContext,
    btcd: new BtcdClient(config.bitcoin.btcd)
  };

  return context;
};

export default createContext;
