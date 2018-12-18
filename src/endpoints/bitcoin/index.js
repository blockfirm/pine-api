import * as feesEstimate from './fees/estimate';
import * as transactions from './transactions';
import * as subscriptions from './subscriptions';

const endpoints = {
  '/fees/estimate': feesEstimate,
  '/transactions': transactions,
  '/subscriptions': subscriptions
};

export default endpoints;
