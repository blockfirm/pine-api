export default function handleError(error, response) {
  const status = error.status || 500;
  const message = error.message || 'Unknown error';

  response.send(status, { error: message });

  console.error(`${status} ${message}`);
}
