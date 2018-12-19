import axios from 'axios';
import { unsubscribe } from './endpoints/bitcoin/subscriptions/deleteById';

export default class NotificationService {
  constructor(config, context) {
    this.config = config;
    this.context = context;
    this.context.btcd.onRelevantTxAccepted = this._onRelevantTxAccepted.bind(this);

    this._load()
      .then(() => {
        console.log('[NOTIFICATIONS] ✅ Notification filter loaded');
      })
      .catch((error) => {
        console.error('[NOTIFICATIONS] 🔥 Error loading notification filter:', error.message);
      });
  }

  addAddressesToFilter(addresses) {
    const { btcd } = this.context;
    return btcd.loadTxFilter(false, addresses);
  }

  _load() {
    const { redis } = this.context;

    return redis.keys('device-tokens:*:addresses').then((keys) => {
      const promises = keys.map((key) => {
        return redis.smembers(key).then((addresses) => {
          return this.addAddressesToFilter(addresses);
        });
      });

      return Promise.all(promises);
    });
  }

  _onRelevantTxAccepted(rawTransaction) {
    this.context.btcd.decodeRawTransaction(rawTransaction)
      .then((transaction) => {
        this._notify(transaction);
      })
      .catch((error) => {
        console.error('[NOTIFICATIONS] 🔥 Error decoding transaction:', error.message);
      });
  }

  _notify(transaction) {
    const { apn, redis } = this.context;
    const { webhook } = this.config.notifications;

    if (!transaction || !Array.isArray(transaction.vout)) {
      return;
    }

    const addresses = transaction.vout.reduce((list, vout) => {
      return [
        ...list,
        ...vout.scriptPubKey.addresses
      ];
    }, []);

    addresses.forEach((address) => {
      redis.smembers(`subscriptions:btc:${address}:device-tokens`).then((deviceTokens) => {
        if (!Array.isArray(deviceTokens)) {
          return;
        }

        deviceTokens.forEach((deviceToken) => {
          let promise;

          if (webhook) {
            promise = this._sendWithWebhook(deviceToken);
          } else {
            promise = apn.send(this.config.apn.notifications.newPayment, deviceToken);
          }

          promise.then(this._handleUnsubscribe.bind(this));
        });
      });
    });
  }

  _sendWithWebhook(deviceToken) {
    const { webhook } = this.config.notifications;

    return axios.post(webhook, { deviceToken })
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        console.error('[NOTIFICATIONS] 🔥 Error calling webhook:', error.message);
      });
  }

  _handleUnsubscribe(results) {
    const { redis } = this.context;

    if (!results || !Array.isArray(results.failed)) {
      return;
    }

    results.failed.forEach((result) => {
      if (!result || !result.device || !result.status) {
        return;
      }

      const status = parseInt(result.status);
      const reason = result.response && result.response.reason;

      if (status >= 400 && status < 500) {
        console.log(`[NOTIFICATIONS] Unsubscribing (${reason}):`, result.device);

        unsubscribe(redis, result.device).catch((error) => {
          console.error('[NOTIFICATIONS] 🔥 Error unsubscribing:', error.message);
        });
      }
    });
  }
}
