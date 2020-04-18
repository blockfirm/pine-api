import restify from 'restify';
import config from './config';
import logger from './logger';
import setupRoutes from './setupRoutes';

const server = restify.createServer();

server.use(restify.plugins.bodyParser({
  mapParams: true
}));

server.use(restify.plugins.queryParser());
server.use(restify.plugins.throttle(config.api.rateLimit));

// eslint-disable-next-line max-params
server.on('after', (request, response, route, error) => {
  if (error) {
    return logger.error(
      `HTTP ${response.statusCode} ${response.statusMessage} ${request.method} ${request.url}: ${error.message}`, {
        scope: 'Api',
        method: request.method,
        route: route && route.path,
        status: response.statusCode
      }
    );
  }

  logger.info(
    `HTTP ${response.statusCode} ${response.statusMessage} ${request.method} ${route.path}`, {
      method: request.method,
      route: route.path,
      status: response.statusCode
    }
  );
});

setupRoutes(server);

server.listen(config.api.port, () => {
  logger.info(`Pine API is listening at ${server.url}`, { scope: 'Api' });
});
