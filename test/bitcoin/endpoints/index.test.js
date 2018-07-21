import assert from 'assert';
import endpoints from '../../../src/bitcoin/endpoints';

describe('bitcoin/endpoints/index.js', () => {
  it('exports an object', () => {
    assert.equal(typeof endpoints, 'object');
  });

  describe('endpoints', () => {
    describe('/transactions', () => {
      it('is an object', () => {
        assert.equal(typeof endpoints['/transactions'], 'object');
      });
    });
  });
});
