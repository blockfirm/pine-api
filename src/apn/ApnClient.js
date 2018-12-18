import apn from 'apn';

const SOUND = 'ping.aiff';

export default class ApnClient {
  constructor(config) {
    this.config = config;
    this._connect();
  }

  _connect() {
    const config = this.config;

    if (!config || !config.token || !config.token.key) {
      return;
    }

    this.provider = new apn.Provider({
      production: config.production,
      token: {
        ...config.token
      }
    });

    console.log('[APN] ✅ Connected');
  }

  send(message, deviceToken) {
    const notification = new apn.Notification();

    if (!this.provider) {
      return;
    }

    notification.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
    notification.badge = 1;
    notification.sound = SOUND;
    notification.alert = message;
    notification.topic = this.config.bundleId;

    return this.provider.send(notification, [deviceToken]);
  }
}
