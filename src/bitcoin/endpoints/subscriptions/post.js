import { HttpBadRequest, HttpInternalServerError } from '../../../errors';
import validateAddress from '../../validateAddress';

const validateParams = (deviceToken, addresses, config) => {
  if (!deviceToken || typeof deviceToken !== 'string') {
    throw new HttpBadRequest(
      'The deviceToken parameter must be a string'
    );
  }

  if (deviceToken.length > 512) {
    throw new HttpBadRequest(
      'The deviceToken string is too long'
    );
  }

  if (!addresses || !Array.isArray(addresses)) {
    throw new HttpBadRequest(
      'The addresses parameter must be an array'
    );
  }

  if (addresses.length > 1000) {
    throw new HttpBadRequest(
      'Maximum 1000 addresses can be sent with each request'
    );
  }

  const hasInvalidAddress = addresses.some((address) => {
    return !validateAddress(address, config.bitcoin.network);
  });

  if (hasInvalidAddress) {
    throw new HttpBadRequest(
      `All addresses must be valid ${config.bitcoin.network} addresses`
    );
  }
};

const post = function post(request, response) {
  const deviceToken = request.params.deviceToken;
  const addresses = request.params.addresses;

  return Promise.resolve().then(() => {
    validateParams(deviceToken, addresses, this.config);

    const promises = addresses.map((address) => {
      return this.redis.sadd(`subscriptions:btc:${address}:device-tokens`, deviceToken);
    });

    promises.push(
      this.redis.sadd(`device-tokens:${deviceToken}:addresses`, addresses)
    );

    return Promise.all(promises)
      .then(() => {
        response.send(200);
      })
      .catch((error) => {
        throw new HttpInternalServerError(error.message);
      });
  });
};

export default post;
