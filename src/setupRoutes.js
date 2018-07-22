import config from './config';
import wrapEndpoint from './wrapEndpoint';
import * as bitcoin from './bitcoin';

function getFullPath(namespace, path) {
  return `/${config.api.version}${namespace}${path}`;
}

// eslint-disable-next-line max-params
function createRoutesForEndpoints(server, namespace, endpoints, context) {
  Object.keys(endpoints).forEach((path) => {
    const handlers = endpoints[path];

    Object.keys(handlers).forEach((method) => {
      const handler = handlers[method];
      server[method](getFullPath(namespace, path), wrapEndpoint(handler, context));
    });
  });
}

function createRoutesForPlatform(server, namespace, platform) {
  const context = platform.createContext(config);
  createRoutesForEndpoints(server, namespace, platform.endpoints, context);
}

export default function setupRoutes(server) {
  createRoutesForPlatform(server, '/bitcoin', bitcoin);
}
