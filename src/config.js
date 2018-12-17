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
  },
  redis: {
    host: '127.0.0.1',
    port: 6379
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
