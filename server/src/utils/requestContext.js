import { v4 as uuidv4 } from "uuid";

export function attachRequestContext(req, res, next) {
  const requestId = req.headers["x-request-id"] || uuidv4();
  req.requestId = requestId;
  res.setHeader("x-request-id", requestId);
  next();
}
