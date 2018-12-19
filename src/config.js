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
    host: '127.0.0.1',
    port: 6379
  },
  notifications: {
    //webhook: 'http://localhost:8080/v1/notifications'
  },
  apn: {
    production: false,
    bundleId: 'se.blockfirm.Pine',
    token: {
      key: '', // Path to .p8 key file.
      keyId: '',
      teamId: ''
    },
    notifications: {
      newPayment: '🗣🍍 You just received a new payment!'
    }
  }
};

export default config;
