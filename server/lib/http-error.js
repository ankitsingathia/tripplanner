/**
 * An Error that carries the HTTP status it should be reported as.
 *
 * Services throw these instead of formatting responses themselves, so the
 * status travels with the failure and the error middleware is the only place
 * that knows how to turn one into JSON.
 */
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

export const badRequest = (message) => new HttpError(400, message);
export const badGateway = (message) => new HttpError(502, message);
