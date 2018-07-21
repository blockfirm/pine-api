import config from './config';
import wrapEndpoint from './wrapEndpoint';
import bitcoinEndpoints from './bitcoin/endpoints';

function getFullPath(namespace, path) {
  return `/${config.api.version}${namespace}${path}`;
}

function createRoutesForEndpoints(server, namespace, endpoints) {
  Object.keys(endpoints).forEach((path) => {
    const handlers = endpoints[path];

    Object.keys(handlers).forEach((method) => {
      const handler = handlers[method];
      server[method](getFullPath(namespace, path), wrapEndpoint(handler));
    });
  });
}

export default function setupRoutes(server) {
  createRoutesForEndpoints(server, '/bitcoin', bitcoinEndpoints);
}
