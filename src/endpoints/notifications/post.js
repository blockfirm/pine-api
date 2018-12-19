import { HttpInternalServerError, HttpBadRequest } from '../../errors';

const post = function post(request, response) {
  const deviceToken = request.params.deviceToken;

  return Promise.resolve().then(() => {
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

    return this.apn.send(this.config.apn.notifications.newPayment, deviceToken)
      .then((result) => {
        response.send(result);
      })
      .catch((error) => {
        throw new HttpInternalServerError(error.message);
      });
  });
};

post.rateLimit = {
  burst: 10,
  rate: 2
};

export default post;
