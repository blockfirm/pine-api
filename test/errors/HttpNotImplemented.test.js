import assert from 'assert';
import HttpNotImplemented from '../../src/errors/HttpNotImplemented';

describe('errors/HttpNotImplemented.js', () => {
  describe('HttpNotImplemented()', () => {
    it('inherits from Error', () => {
      const error = new HttpNotImplemented();
      assert(error instanceof Error);
    });

    describe('#status', () => {
      it('equals 501', () => {
        const error = new HttpNotImplemented();
        assert.equal(error.status, 501);
      });
    });

    describe('#message', () => {
      it('equals the string passed to the constructor', () => {
        const message = '466382df-7754-47d4-b7d1-5737772dbece';
        const error = new HttpNotImplemented(message);

        assert.equal(error.message, message);
      });
    });
  });
});
