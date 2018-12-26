import bitcoinaverage from 'bitcoinaverage';

export default class FiatRateService {
  constructor(config, context) {
    this.config = config;
    this.context = context;

    this.client = bitcoinaverage.restfulClient(
      config.bitcoinAverage.publicKey,
      config.bitcoinAverage.secretKey
    );

    this._start();
    console.log('[FIAT RATES] ✅ Service started');
  }

  _start() {
    // Get initial fiat rates.
    this._update();

    // Update fiat rates with an interval.
    this._interval = setInterval(this._update.bind(this), this.config.updateInterval);
  }

  _update() {
    const { redis } = this.context;

    try {
      this.client.tickerAll('global', 'BTC', '', (response) => {
        if (!response) {
          throw new Error('Empty response from BitcoinAverage');
        }

        const rates = JSON.parse(response);
        const symbols = Object.keys(rates);

        const promises = symbols.map((symbol) => {
          const rate = rates[symbol].last;

          return redis.set(`fiatrates:${symbol}`, rate).then(() => {
            return redis.expire(`fiatrates:${symbol}`, this.config.expireSeconds);
          });
        });

        Promise.all(promises).then(() => {
          console.log('[FIAT RATES] ✅ Fiat rates updated');
        });
      }, (error) => {
        throw error;
      });
    } catch (error) {
      console.error('[FIAT RATES] 🔥 Error getting fiat rates for BTC:', error);
    }
  }
}
