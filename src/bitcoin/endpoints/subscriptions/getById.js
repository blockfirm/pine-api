import { HttpBadRequest, HttpInternalServerError } from '../../../errors';

const getById = function getById(request, response) {
  const params = request.params;

  return Promise.resolve().then(() => {
    const deviceToken = params.id;

    if (!deviceToken || typeof deviceToken !== 'string') {
      throw new HttpBadRequest(
        'The deviceToken parameter must be a string'
      );
    }

    return this.redis.scard(`device-tokens:${deviceToken}:addresses`)
      .then((numberOfSubscriptions) => {
        response.send({
          numberOfSubscriptions
        });
      })
      .catch((error) => {
        throw new HttpInternalServerError(error.message);
      });
  });
};

export default getById;
