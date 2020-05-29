/* eslint-disable max-lines */
import fs from 'fs';
import WebSocket from 'ws';
import logger from '../logger';

const JSON_RPC_VERSION = '1.0';
const RECONNECT_INTERVAL = 1000;
const DEFAULT_PAGE_SIZE = 100;

const ERROR_CODE_NORMAL_CLOSE = 1000;
const ERROR_CODE_NO_INFORMATION_AVAILABLE = -5;

export default class BtcdClient {
  constructor(config) {
    this.config = config;
    this.logger = logger.child({ scope: 'BtcdClient' });

    this._tryConnect();
  }

  _tryConnect() {
    try {
      this._connect();
    } catch (error) {
      this.logger.error(`Unable to connect to btcd: ${error.message}`);
    }
  }

  _connect() {
    const { uri, username, password, certificatePath } = this.config;
    const cert = certificatePath && fs.readFileSync(certificatePath);

    this._disconnect();

    this.websocket = new WebSocket(uri, {
      headers: {
        // eslint-disable-next-line prefer-template
        Authorization: 'Basic ' + new Buffer(`${username}:${password}`).toString('base64')
      },
      rejectUnauthorized: false,
      ca: [cert],
      cert
    });

    this.callCounter = 0;
    this.callbacks = {};

    this.websocket.on('open', this._onOpen.bind(this));
    this.websocket.on('close', this._onClose.bind(this));
    this.websocket.on('error', this._onError.bind(this));
    this.websocket.on('message', this._onMessage.bind(this));
  }

  _disconnect() {
    const websocket = this.websocket;

    if (!websocket) {
      return;
    }

    websocket.removeAllListeners();
    websocket.close();

    delete this.websocket;
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

  getInfo() {
    return this.call('getinfo');
  }

  sendRawTransaction(transaction) {
    return this.call('sendrawtransaction', [
      transaction
    ]);
  }

  decodeRawTransaction(rawTransaction) {
    return this.call('decoderawtransaction', [
      rawTransaction
    ]);
  }

  getRawTransaction(txid) {
    const verbose = 1;

    const params = [
      txid,
      verbose
    ];

    return this.call('getrawtransaction', params)
      .then((transaction) => {
        /**
         * The getrawtransaction API doesn't return a time for
         * unconfirmed transactions. Ideally, it would be the time
         * at which it was received by the node. This workaound
         * sets it to the current time instead.
         */
        transaction.time = transaction.time || (new Date().getTime() / 1000);
        return transaction;
      });
  }

  // eslint-disable-next-line max-params
  searchRawTransactions(address, page, pageSize = DEFAULT_PAGE_SIZE, reverse = false) {
    const verbose = 1;
    const skip = (page - 1) * pageSize;
    const count = pageSize;
    const vinextra = 1;

    const params = [
      address,
      verbose,
      skip,
      count,
      vinextra,
      reverse
    ];

    return this.call('searchrawtransactions', params)
      .then((transactions) => {
        /**
         * The searchrawtransactions API doesn't return a time for
         * unconfirmed transactions. Ideally, it would be the time
         * at which it was received by the node. This workaound
         * sets it to the current time instead.
         */
        transactions.forEach((transaction) => {
          transaction.time = transaction.time || (new Date().getTime() / 1000);
        });

        return transactions;
      })
      .catch((error) => {
        if (error.code === ERROR_CODE_NO_INFORMATION_AVAILABLE) {
          /**
           * No information available about address.
           * Suppress error and return an empty array.
           */
          return [];
        }

        throw error;
      });
  }

  estimateFee(numberOfBlocks) {
    return this.call('estimatefee', [
      numberOfBlocks || 1
    ]);
  }

  loadTxFilter(reload, addresses, outpoints) {
    return this.call('loadtxfilter', [
      reload,
      addresses,
      outpoints
    ]);
  }

  onRelevantTxAccepted() {}

  _onOpen() {
    this.logger.info(`Connected to btcd at ${this.config.uri}`);
  }

  _onClose(code) {
    this.logger.error(`Disconnected from btcd (code: ${code})`);

    if (code === ERROR_CODE_NORMAL_CLOSE) {
      return;
    }

    // Try to reconnect.
    setTimeout(() => {
      this._tryConnect();
    }, RECONNECT_INTERVAL);
  }

  _onError(error) {
    this.logger.error(`Btcd error: ${error.message}`);
  }

  _onMessage(message) {
    const data = JSON.parse(message);
    const callback = this.callbacks[data.id];

    if (callback) {
      callback(data.error, data.result);
      delete this.callbacks[data.id];
    } else if (data.method === 'relevanttxaccepted') {
      this.onRelevantTxAccepted(data.params[0]);
    }
  }
}
