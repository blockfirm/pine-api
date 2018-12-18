import assert from 'assert';
import sinon from 'sinon';

import { HttpBadRequest, HttpInternalServerError } from '../../../../src/errors';
import * as transactionsEndpoints from '../../../../src/endpoints/bitcoin/transactions';

describe('endpoints/bitcoin/transactions/post.js', () => {
  describe('#post(request, response)', () => {
    let fakeTransaction;
    let fakeTxid;
    let fakeRequest;
    let fakeResponse;
    let sendRawTransactionSpy;
    let fakeClient;
    let fakeContext;

    beforeEach(() => {
      fakeTransaction = '01000000017b1eabe0209b1fe794124575ef807057c77ada2138ae4fa8d6c4de0398a14f3f0000000000ffffffff01f0ca052a010000001976a914cbc20a7664f2f69e5355aa427045bc15e7c6c77288ac00000000';
      fakeTxid = '3af6ef78-99ce-4f35-bd29-3110517cc738';

      sendRawTransactionSpy = sinon.spy(function () {
        return Promise.resolve(fakeTxid);
      });

      fakeRequest = {
        params: {
          transaction: fakeTransaction
        }
      };

      fakeResponse = {
        send: sinon.spy()
      };

      fakeClient = {
        sendRawTransaction: sendRawTransactionSpy
      };

      fakeContext = {
        btcd: fakeClient
      };
    });

    it('accepts two arguments', () => {
      const actual = transactionsEndpoints.post.length;
      const expected = 2;

      assert.equal(actual, expected);
    });

    it('returns a Promise', () => {
      const returnedPromise = transactionsEndpoints.post.call(fakeContext, fakeRequest, fakeResponse);
      assert(returnedPromise instanceof Promise);
    });

    it('calls response.send() with an object with txid', () => {
      const returnedPromise = transactionsEndpoints.post.call(fakeContext, fakeRequest, fakeResponse);

      return returnedPromise.then(() => {
        assert(fakeResponse.send.called);
        assert(fakeResponse.send.calledWithMatch({ txid: fakeTxid }));
      });
    });

    describe('when client.sendRawTransaction(transaction) rejects', () => {
      it('rejects the returned promise with HttpInternalServerError', () => {
        const fakeError = new Error('060bdb8b-8d68-4114-a93b-ed8e5f5a457e');

        fakeClient.sendRawTransaction = sinon.spy(() => {
          return Promise.reject(fakeError);
        });

        const returnedPromise = transactionsEndpoints.post.call(fakeContext, fakeRequest, fakeResponse);

        return returnedPromise
          .then(() => {
            assert(false, 'Did not reject the returned promise');
          })
          .catch((error) => {
            assert(error instanceof HttpInternalServerError);
          });
      });
    });

    describe('when client.sendRawTransaction(transaction) resolves', () => {
      it('calls response.send() with the result as txid', () => {
        const fakeResult = 'e3197e5c-f9dc-4166-808a-9f0fc457cb99';

        fakeClient.sendRawTransaction = sinon.spy(() => {
          return Promise.resolve(fakeResult);
        });

        const returnedPromise = transactionsEndpoints.post.call(fakeContext, fakeRequest, fakeResponse);

        return returnedPromise.then(() => {
          assert(fakeResponse.send.calledOnce);
          assert(fakeResponse.send.calledWith({ txid: fakeResult }));
        });
      });
    });

    describe('when request.params.transaction is an empty string', () => {
      it('rejects the returned promise with HttpBadRequest', () => {
        fakeRequest.params.transaction = '';

        const returnedPromise = transactionsEndpoints.post.call(fakeContext, fakeRequest, fakeResponse);

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

        const returnedPromise = transactionsEndpoints.post.call(fakeContext, fakeRequest, fakeResponse);

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
