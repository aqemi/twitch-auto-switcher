export class NoContentError extends Error {
  constructor() {
    super("Couldn't determine next stream");
    Object.setPrototypeOf(this, NoContentError.prototype);
  }
}
