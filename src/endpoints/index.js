import * as info from './info';
import * as notifications from './notifications';
import bitcoin from './bitcoin';

const endpoints = {
  '/info': info,
  '/bitcoin': bitcoin,
  '/notifications': notifications
};

export default endpoints;
