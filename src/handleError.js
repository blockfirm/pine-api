import logger from './logger';

const handleError = (error, response, next) => {
  const status = error.status || 500;
  let message = error.message || 'Unknown error';

  if (status === 500) {
    message = 'An unexpected error occurred on the server';

    logger.error(`Unexpected server error (${status}): ${error.message}`, {
      scope: 'Api',
      status
    });
  }

  response.send(status, { error: message });
  next();
};

export default handleError;
