import { HttpBadRequest } from '../../../errors';

const post = function post(request, response) {
  const transaction = request.params.transaction;

  return Promise.resolve().then(() => {
    if (!transaction || typeof transaction !== 'string') {
      throw new HttpBadRequest(
        'Transaction must be a transaction serialized in raw format (https://bitcoin.org/en/developer-reference#raw-transaction-format)'
      );
    }

    return this.btcd.sendRawTransaction(transaction)
      .then((txid) => {
        response.send({ txid });
      });
  });
};

export default post;
