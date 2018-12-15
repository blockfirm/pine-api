import { BtcdClient } from './client';

const createContext = (config) => {
  const context = {
    btcd: new BtcdClient(config.bitcoin.btcd),
    config
  };

  return context;
};

export default createContext;
