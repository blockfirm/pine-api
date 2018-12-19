import { HttpBadRequest, HttpInternalServerError } from '../../../errors';

export const unsubscribe = (redis, deviceToken) => {
  return redis.smembers(`device-tokens:${deviceToken}:addresses`)
    .then((addresses) => {
      if (!addresses) {
        return;
      }

      const promises = addresses.map((address) => {
        return redis.srem(`subscriptions:btc:${address}:device-tokens`, deviceToken);
      });

      return Promise.all(promises);
    })
    .then(() => {
      return redis.del(`device-tokens:${deviceToken}:addresses`);
    });
};

const deleteById = function deleteById(request, response) {
  const params = request.params;

  return Promise.resolve().then(() => {
    const deviceToken = params.id;

    if (!deviceToken || typeof deviceToken !== 'string') {
      throw new HttpBadRequest(
        'The deviceToken parameter must be a string'
      );
    }

    return unsubscribe(this.redis, deviceToken)
      .then(() => {
        response.send(200);
      })
      .catch((error) => {
        throw new HttpInternalServerError(error.message);
      });
  });
};

export default deleteById;
