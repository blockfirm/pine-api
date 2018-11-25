import * as feesEstimate from './fees/estimate';
import * as transactions from './transactions';

const endpoints = {
  '/fees/estimate': feesEstimate,
  '/transactions': transactions
};

export default endpoints;
