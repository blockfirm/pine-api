import apn from 'apn';

const SOUND = 'ping.aiff';

export default class ApnClient {
  constructor(config) {
    this.config = config;
    this._connect();
  }

  _connect() {
    this.provider = new apn.Provider({
      production: this.config.production,
      token: {
        ...this.config.token
      }
    });

    console.log('[APN] ✅ Connected');
  }

  send(message, deviceToken) {
    const notification = new apn.Notification();

    notification.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
    notification.badge = 1;
    notification.sound = SOUND;
    notification.alert = message;
    notification.topic = this.config.bundleId;

    return this.provider.send(notification, [deviceToken]);
  }
}
