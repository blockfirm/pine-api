import { HttpBadRequest, HttpInternalServerError } from '../../../errors';

const getById = function getById(request, response) {
  const params = request.params;

  return Promise.resolve().then(() => {
    const txid = params.id;

    if (!txid || typeof txid !== 'string') {
      throw new HttpBadRequest(
        'The txid parameter must be a transaction hash'
      );
    }

    return this.btcd.getRawTransaction(txid)
      .then((transaction) => {
        response.send(transaction);
      })
      .catch((error) => {
        throw new HttpInternalServerError(error.message);
      });
  });
};

export default getById;
