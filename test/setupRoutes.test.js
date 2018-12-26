import proxyquire from 'proxyquire';
import assert from 'assert';
import sinon from 'sinon';

const wrapEndpointSpy = sinon.spy();

const setupRoutes = proxyquire('../src/setupRoutes', {
  './createContext': { default: () => ({}) },
  './wrapEndpoint': { default: wrapEndpointSpy }
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
        post: sinon.spy(),
        del: sinon.spy()
      };
    });

    it('registers the route GET /v1/info', () => {
      setupRoutes(fakeServer);

      assert(fakeServer.get.called);
      assert(fakeServer.get.calledWithMatch('/v1/info'));
    });

    it('registers the route POST /v1/notifications', () => {
      setupRoutes(fakeServer);

      assert(fakeServer.post.called);
      assert(fakeServer.post.calledWithMatch('/v1/notifications'));
    });

    it('registers the route GET /v1/bitcoin/fees/estimate', () => {
      setupRoutes(fakeServer);

      assert(fakeServer.get.called);
      assert(fakeServer.get.calledWithMatch('/v1/bitcoin/fees/estimate'));
    });

    it('registers the route GET /v1/bitcoin/transactions', () => {
      setupRoutes(fakeServer);

      assert(fakeServer.get.called);
      assert(fakeServer.get.calledWithMatch('/v1/bitcoin/transactions'));
    });

    it('registers the route GET /v1/bitcoin/transactions/:id', () => {
      setupRoutes(fakeServer);

      assert(fakeServer.get.called);
      assert(fakeServer.get.calledWithMatch('/v1/bitcoin/transactions/:id'));
    });

    it('registers the route POST /v1/bitcoin/transactions', () => {
      setupRoutes(fakeServer);

      assert(fakeServer.post.called);
      assert(fakeServer.post.calledWithMatch('/v1/bitcoin/transactions'));
    });

    it('registers the route POST /v1/bitcoin/subscriptions', () => {
      setupRoutes(fakeServer);

      assert(fakeServer.post.called);
      assert(fakeServer.post.calledWithMatch('/v1/bitcoin/subscriptions'));
    });

    it('registers the route GET /v1/bitcoin/subscriptions/:id', () => {
      setupRoutes(fakeServer);

      assert(fakeServer.get.called);
      assert(fakeServer.get.calledWithMatch('/v1/bitcoin/subscriptions/:id'));
    });

    it('registers the route DELETE /v1/bitcoin/subscriptions/:id', () => {
      setupRoutes(fakeServer);

      assert(fakeServer.del.called);
      assert(fakeServer.del.calledWithMatch('/v1/bitcoin/subscriptions/:id'));
    });

    it('registers the route GET /v1/bitcoin/fiatrates', () => {
      setupRoutes(fakeServer);

      assert(fakeServer.get.called);
      assert(fakeServer.get.calledWithMatch('/v1/bitcoin/fiatrates'));
    });

    it('wraps each endpoint with wrapEndpoint()', () => {
      setupRoutes(fakeServer);
      assert.equal(wrapEndpointSpy.callCount, 10);
    });
  });
});
