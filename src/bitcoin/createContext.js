import { BtcdClient } from './client';

export default function createContext(config) {
  const context = {
    client: new BtcdClient(config.bitcoin.btcd)
  };

  return context;
}
