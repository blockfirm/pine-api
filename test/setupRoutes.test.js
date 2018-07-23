import proxyquire from 'proxyquire';
import assert from 'assert';
import sinon from 'sinon';
import * as bitcoin from '../src/bitcoin';

const wrapEndpointSpy = sinon.spy();

const setupRoutes = proxyquire('../src/setupRoutes', {
  './wrapEndpoint': { default: wrapEndpointSpy },
  './bitcoin': {
    endpoints: bitcoin.endpoints,
    createContext: () => ({})
  }
}).default;

describe('setupRoutes.js', () => {
  beforeEach(() => {
    wrapEndpointSpy.resetHistory();
  });

  describe('setupRoutes(server)', () => {
    let fakeServer;

    beforeEach(() => {
      fakeServer = {
        get: sinon.spy(),
        post: sinon.spy()
      };
    });

    it('registers the route GET /v1/bitcoin/transactions', () => {
      setupRoutes(fakeServer);

      assert(fakeServer.get.called);
      assert(fakeServer.get.calledWithMatch('/v1/bitcoin/transactions'));
    });

    it('registers the route POST /v1/bitcoin/transactions', () => {
      setupRoutes(fakeServer);

      assert(fakeServer.post.called);
      assert(fakeServer.post.calledWithMatch('/v1/bitcoin/transactions'));
    });

    it('wraps each endpoint with wrapEndpoint()', () => {
      setupRoutes(fakeServer);
      assert.equal(wrapEndpointSpy.callCount, 2);
    });
  });
});
