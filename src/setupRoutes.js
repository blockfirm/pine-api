import config from './config';
import createContext from './createContext';
import wrapEndpoint from './wrapEndpoint';
import rootEndpoints from './endpoints';

const getFullPath = (namespace, path) => {
  return `/${config.api.version}${namespace}${path}`;
};

// eslint-disable-next-line max-params
const createRoutesForEndpoints = (server, namespace, endpoints, context) => {
  Object.keys(endpoints).forEach((path) => {
    const handlers = endpoints[path];

    if (Object.keys(handlers)[0].indexOf('/') === 0) {
      // This route contains its own set of endpoints.
      return createRoutesForEndpoints(server, namespace + path, handlers, context);
    }

    Object.keys(handlers).forEach((method) => {
      const handler = handlers[method];
      let serverMethod = method;
      let serverPath = path;

      if (method === 'getById') {
        serverMethod = 'get';
        serverPath = `${path}/:id`;
      } else if (method === 'deleteById') {
        serverMethod = 'del';
        serverPath = `${path}/:id`;
      }

      server[serverMethod](
        getFullPath(namespace, serverPath),
        wrapEndpoint(handler, context)
      );
    });
  });
};

const setupRoutes = (server) => {
  const context = createContext(config);
  createRoutesForEndpoints(server, '', rootEndpoints, context);
};

export default setupRoutes;
