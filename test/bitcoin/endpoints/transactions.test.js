import assert from 'assert';
import sinon from 'sinon';

import { HttpBadRequest } from '../../../src/errors';
import * as transactionsEndpoints from '../../../src/bitcoin/endpoints/transactions';

describe('endpoints/transactions.js', () => {
  describe('#post(request, response)', () => {
    let fakeTransaction;
    let fakeRequest;
    let fakeResponse;

    beforeEach(() => {
      fakeTransaction = '01000000017b1eabe0209b1fe794124575ef807057c77ada2138ae4fa8d6c4de0398a14f3f0000000000ffffffff01f0ca052a010000001976a914cbc20a7664f2f69e5355aa427045bc15e7c6c77288ac00000000';

      fakeRequest = {
        params: {
          transaction: fakeTransaction
        }
      };

      fakeResponse = {
        send: sinon.spy()
      };
    });

    it('accepts two arguments', () => {
      const actual = transactionsEndpoints.post.length;
      const expected = 2;

      assert.equal(actual, expected);
    });

    it('returns a Promise', () => {
      const returnedPromise = transactionsEndpoints.post(fakeRequest, fakeResponse);
      assert(returnedPromise instanceof Promise);
    });

    it('calls response.send() with an object with txid', () => {
      const returnedPromise = transactionsEndpoints.post(fakeRequest, fakeResponse);

      return returnedPromise.then(() => {
        assert(fakeResponse.send.called);
        assert(fakeResponse.send.calledWithMatch({ txid: 'test' }));
      });
    });

    describe('when request.params.transaction is an empty string', () => {
      it('rejects the returned promise with HttpBadRequest', () => {
        fakeRequest.params.transaction = '';

        const returnedPromise = transactionsEndpoints.post(fakeRequest, fakeResponse);

        return returnedPromise
          .then(() => {
            assert(false, 'Did not reject the returned promise');
          })
          .catch((error) => {
            assert(error instanceof HttpBadRequest);
            assert(fakeResponse.send.notCalled);
          });
      });
    });

    describe('when request.params.transaction is undefined', () => {
      it('rejects the returned promise with HttpBadRequest', () => {
        fakeRequest.params.transaction = undefined;

        const returnedPromise = transactionsEndpoints.post(fakeRequest, fakeResponse);

        return returnedPromise
          .then(() => {
            assert(false, 'Did not reject the returned promise');
          })
          .catch((error) => {
            assert(error instanceof HttpBadRequest);
            assert(fakeResponse.send.notCalled);
          });
      });
    });
  });
});
