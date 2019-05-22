import { HttpBadRequest, HttpInternalServerError } from '../../../../errors';

const get = function get(request, response) {
  const params = request.query;

  return Promise.resolve().then(() => {
    const { numberOfBlocks } = params;

    if (numberOfBlocks && isNaN(numberOfBlocks)) {
      throw new HttpBadRequest(
        'The numberOfBlocks parameter must be a number'
      );
    }

    /**
     * NOTE: This is using the `estimatefee` RPC API to get a fee estimate,
     * but it's been deprecated in bitcoind in favor of `estimatesmartfee`.
     * `estimatesmartfee` should be used instead once it has been
     * implemented in btcd.
     * <https://github.com/btcsuite/btcd/issues/1146>
     */
    return this.btcd.estimateFee(parseInt(numberOfBlocks))
      .then((btcPerKilobyte) => {
        const btcPerByte = btcPerKilobyte / 1000;
        const satoshisPerByte = btcPerByte * 100000000;

        response.send({ satoshisPerByte });
      })
      .catch((error) => {
        throw new HttpInternalServerError(error.message);
      });
  });
};

export default get;
