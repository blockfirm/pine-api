import { HttpBadRequest, HttpInternalServerError, HttpNotImplemented } from '../../../errors';

const get = function get(request, response) {
  const params = request.query;

  if (!this.config.fiatRates.enabled) {
    throw new HttpNotImplemented(
      'The fiat rate service has not been enabled on this server'
    );
  }

  return Promise.resolve().then(() => {
    if (!params.currencies || typeof params.currencies !== 'string') {
      throw new HttpBadRequest(
        'The currencies field must be a string of comma-separated ISO 4217 codes'
      );
    }

    const currencies = params.currencies.split(',');

    if (currencies.length === 0) {
      throw new HttpBadRequest(
        'At least one currency must be provided'
      );
    }

    if (currencies.length > 200) {
      throw new HttpBadRequest(
        'Maximum 200 currencies are allowed per request'
      );
    }

    const promises = currencies.map((currency) => {
      return this.redis.get(`fiatrates:BTC${currency.toUpperCase().trim()}`);
    });

    return Promise.all(promises)
      .then((results) => {
        const rates = {};

        results.forEach((result, index) => {
          rates[currencies[index]] = parseFloat(result);
        });

        response.send(rates);
      })
      .catch((error) => {
        throw new HttpInternalServerError(error.message);
      });
  });
};

export default get;
