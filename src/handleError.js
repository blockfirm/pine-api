const handleError = (error, response) => {
  const status = error.status || 500;
  let message = error.message || 'Unknown error';

  if (status === 500) {
    message = 'An unexpected error occurred on the server';
  }

  response.send(status, { error: message });

  console.error(`[API] ERROR ${status}: ${error.message}`);
};

export default handleError;
