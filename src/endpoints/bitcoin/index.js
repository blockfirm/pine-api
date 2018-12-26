import * as feesEstimate from './fees/estimate';
import * as fiatRates from './fiatrates';
import * as transactions from './transactions';
import * as subscriptions from './subscriptions';

const endpoints = {
  '/fees/estimate': feesEstimate,
  '/fiatrates': fiatRates,
  '/transactions': transactions,
  '/subscriptions': subscriptions
};

export default endpoints;
