import { HttpBadRequest, HttpInternalServerError } from '../../errors';

const mapResults = (results) => {
  const addressMap = {};

  results.forEach((result) => {
    addressMap[result.address] = result.transactions;
  });

  return addressMap;
};

export const get = function (request, response) {
  const params = request.query;

  return Promise.resolve().then(() => {
    if (!params.addresses || typeof params.addresses !== 'string') {
      throw new HttpBadRequest(
        'The addresses field must be a string of comma-separated addresses'
      );
    }

    const addresses = params.addresses.split(',');
    const page = parseInt(params.page) || 1;

    if (page < 1 || page > 1000) {
      throw new HttpBadRequest(
        'Page must be an integer between 1 and 1000'
      );
    }

    if (addresses.length === 0) {
      throw new HttpBadRequest(
        'At least one address must be provided'
      );
    }

    if (addresses.length > 20) {
      throw new HttpBadRequest(
        'Maximum 20 addresses are allowed per request'
      );
    }

    const promises = addresses.map((address) => {
      return this.client.searchRawTransactions(address, page).then((transactions) => {
        return { address, transactions };
      });
    });

    return Promise.all(promises)
      .then(mapResults)
      .then((addressMap) => {
        response.send(addressMap);
      })
      .catch((error) => {
        throw new HttpInternalServerError(error.message);
      });
  });
};

export const post = function (request, response) {
  const transaction = request.params.transaction;

  return Promise.resolve().then(() => {
    if (!transaction || typeof transaction !== 'string') {
      throw new HttpBadRequest(
        'Transaction must be a transaction serialized in raw format (https://bitcoin.org/en/developer-reference#raw-transaction-format)'
      );
    }

    return this.client.sendRawTransaction(transaction)
      .then((txid) => {
        response.send({ txid });
      })
      .catch((error) => {
        throw new HttpInternalServerError(error.message);
      });
  });
};
