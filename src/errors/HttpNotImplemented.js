export default class HttpNotImplemented extends Error {
  constructor(...args) {
    super(...args);
    Error.captureStackTrace(this, HttpNotImplemented);
    this.status = 501;
  }
}
