import * as feesEstimate from './fees/estimate';
import * as fiatRates from './fiatrates';
import * as transactions from './transactions';

const endpoints = {
  '/fees/estimate': feesEstimate,
  '/fiatrates': fiatRates,
  '/transactions': transactions
};

export default endpoints;
