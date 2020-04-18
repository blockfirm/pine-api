import bitcoinaverage from 'bitcoinaverage';
import logger from './logger';

export default class FiatRateService {
  constructor(config, context) {
    this.config = config;
    this.context = context;
    this.logger = logger.child({ scope: 'FiatRateService' });

    if (!config.enabled) {
      return this.logger.warn(
        'Fiat Rates Service will not be started - it has not been enabled in config'
      );
    }

    this.client = bitcoinaverage.restfulClient(
      config.bitcoinAverage.publicKey,
      config.bitcoinAverage.secretKey
    );

    this._start();
  }

  _start() {
    // Get initial fiat rates.
    this._update();

    // Update fiat rates with an interval.
    this._interval = setInterval(this._update.bind(this), this.config.updateInterval);

    this.logger.info('Fiat Rate Service started');
  }

  _update() {
    const { redis } = this.context;

    this.client.tickerAll('global', 'BTC', '', (response) => {
      try {
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
          this.logger.info('Fiat rates updated successfully');
        });
      } catch (error) {
        this.logger.error(`Error when updating fiat rates for BTC: ${error.message}`);
      }
    }, (error) => {
      this.logger.error(`Error when updating fiat rates for BTC: ${error.message}`);
    });
  }
}
