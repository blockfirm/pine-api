import { HttpBadRequest } from '../../../errors';

const mapResults = (results) => {
  const addressMap = {};

  results.forEach((result) => {
    addressMap[result.address] = result.transactions;
  });

  return addressMap;
};

const validateParams = (page, pageSize, addresses) => {
  if (page < 1 || page > 1000) {
    throw new HttpBadRequest(
      'Page must be an integer between 1 and 1000'
    );
  }

  if (pageSize < 1 || pageSize > 100) {
    throw new HttpBadRequest(
      'Page size must be an integer between 1 and 100'
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
};

const get = function get(request, response) {
  const params = request.query;

  return Promise.resolve().then(() => {
    if (!params.addresses || typeof params.addresses !== 'string') {
      throw new HttpBadRequest(
        'The addresses field must be a string of comma-separated addresses'
      );
    }

    const addresses = params.addresses.split(',');
    const page = parseInt(params.page) || 1;
    const pageSize = parseInt(params.page_size) || 100;
    const reverse = params.reverse === '1';

    validateParams(page, pageSize, addresses);

    const promises = addresses.map((address) => {
      return this.btcd.searchRawTransactions(address, page, pageSize, reverse).then((transactions) => {
        return { address, transactions };
      });
    });

    return Promise.all(promises)
      .then(mapResults)
      .then((addressMap) => {
        response.send(addressMap);
      });
  });
};

export default get;
