import config from './config';
import wrapEndpoint from './wrapEndpoint';
import * as bitcoin from './bitcoin';

const getFullPath = (namespace, path) => {
  return `/${config.api.version}${namespace}${path}`;
};

// eslint-disable-next-line max-params
const createRoutesForEndpoints = (server, namespace, endpoints, context) => {
  Object.keys(endpoints).forEach((path) => {
    const handlers = endpoints[path];

    Object.keys(handlers).forEach((method) => {
      const handler = handlers[method];
      let serverMethod = method;
      let serverPath = path;

      if (method === 'getById') {
        serverMethod = 'get';
        serverPath = `${path}/:id`;
      }

      server[serverMethod](
        getFullPath(namespace, serverPath),
        wrapEndpoint(handler, context)
      );
    });
  });
};

const createRoutesForPlatform = (server, namespace, platform) => {
  const context = platform.createContext(config);
  createRoutesForEndpoints(server, namespace, platform.endpoints, context);
};

const setupRoutes = (server) => {
  createRoutesForPlatform(server, '/bitcoin', bitcoin);
};

export default setupRoutes;
