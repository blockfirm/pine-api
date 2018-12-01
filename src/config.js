const config = {
  bitcoin: {
    network: 'testnet', // 'mainnet' or 'testnet'
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
