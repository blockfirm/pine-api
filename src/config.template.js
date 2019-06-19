const config = {
  bitcoin: {
    network: 'mainnet', // 'mainnet' or 'testnet'
    btcd: {
      uri: 'ws://127.0.0.1:18334/ws',
      username: '',
      password: ''
    }
  },
  api: {
    version: 'v1',
    port: 8080,
    rateLimit: {
      burst: 100,
      rate: 10,
      ip: true, // Set to true if directly exposed to the internet.
      xff: false, // Set to true if behind a reverse proxy or similar.
      maxKeys: 100000
    }
  },
  redis: {
    enabled: false,
    host: '127.0.0.1',
    port: 6379
  },
  fiatRates: {
    enabled: false,
    bitcoinAverage: {
      publicKey: '',
      secretKey: ''
    },
    updateInterval: 60 * 1000, // 1 minute.
    expireSeconds: 60 * 60 // 1 hour.
  }
};

export default config;
