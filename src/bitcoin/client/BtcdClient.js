import WebSocket from 'ws';

const JSON_RPC_VERSION = '1.0';

export default class BtcdClient {
  constructor(config) {
    const username = config.username;
    const password = config.password;

    this.websocket = new WebSocket(config.uri, {
      headers: {
        // eslint-disable-next-line prefer-template
        Authorization: 'Basic ' + new Buffer(`${username}:${password}`).toString('base64')
      }
    });

    this.callCounter = 0;
    this.callbacks = {};

    this.websocket.on('open', this._onOpen.bind(this));
    this.websocket.on('close', this._onClose.bind(this));
    this.websocket.on('error', this._onError.bind(this));
    this.websocket.on('message', this._onMessage.bind(this));
  }

  call(method, params) {
    const callId = this.callCounter;

    const payload = {
      jsonrpc: JSON_RPC_VERSION,
      id: callId,
      method,
      params
    };

    this.callCounter++;

    return new Promise((resolve, reject) => {
      this.callbacks[callId] = (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      };

      this.websocket.send(JSON.stringify(payload), (error) => {
        if (error) {
          reject(error);
        }
      });
    });
  }

  sendRawTransaction(transaction) {
    return this.call('sendrawtransaction', [
      transaction
    ]);
  }

  searchRawTransactions(address, page) {
    const verbose = 1;
    const pageSize = 100;
    const skip = (page - 1) * pageSize;
    const count = pageSize;
    const vinextra = 1;

    return this.call('searchrawtransactions', [
      address,
      verbose,
      skip,
      count,
      vinextra
    ]).catch((error) => {
      if (error.code === -5) {
        // No information available about address.
        // Suppress error and return an empty array.
        return [];
      }

      throw error;
    });
  }

  _onOpen() {
    console.log('Connected to btcd.');
  }

  _onClose() {
    console.log('Disconnect from btcd.');
  }

  _onError(error) {
    console.error('btcd error: ', error);
  }

  _onMessage(message) {
    const data = JSON.parse(message);
    const callback = this.callbacks[data.id];

    if (callback) {
      callback(data.error, data.result);
      delete this.callbacks[data.id];
    }
  }
}
