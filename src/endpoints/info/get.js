import { HttpInternalServerError } from '../../errors';

const get = function get(request, response) {
  return Promise.resolve().then(() => {
    return this.btcd.getInfo()
      .then((info) => {
        response.send({
          isConnected: true,
          network: info.testnet ? 'testnet' : 'mainnet',
          blocks: info.blocks
        });
      })
      .catch(() => {
        response.send({
          isConnected: false,
          network: this.config.bitcoin.network,
          blocks: 0
        });
      })
      .catch((error) => {
        throw new HttpInternalServerError(error.message);
      });
  });
};

export default get;
