const config = {
  bitcoin: {
    network: 'testnet', // 'mainnet' or 'testnet'
    fee: {
      // The maximum number of blocks a transaction should have to wait before it is
      // predicted to be included in a block.
      numberOfBlocks: 3
    },
    btcd: {
      uri: 'ws://127.0.0.1:18334/ws',
      username: '',
      password: ''
    }
  },
  api: {
    version: 'v1',
    port: 8080
  }
};

export default config;
