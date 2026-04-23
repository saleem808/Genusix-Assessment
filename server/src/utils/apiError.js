import createHttpError from "http-errors";

export function badRequest(message, details = []) {
  return createHttpError(400, message, { details });
}

export function notFound(message, details = []) {
  return createHttpError(404, message, { details });
}
