import restify from 'restify';
import config from './config';
import setupRoutes from './setupRoutes';

const server = restify.createServer();

server.use(restify.plugins.bodyParser({
  mapParams: true
}));

server.use(restify.plugins.queryParser());

setupRoutes(server);

server.listen(config.api.port, () => {
  console.log('Payla API is listening at %s', server.url);
});
