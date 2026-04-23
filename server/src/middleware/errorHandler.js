export function notFoundHandler(req, _res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.status = 404;
  next(error);
}

export function errorHandler(err, req, res, _next) {
  const status = err.status || 500;

  if (status >= 500) {
    console.error(`[${req.requestId}]`, err);
  }

  res.status(status).json({
    error: {
      code: err.code || (status >= 500 ? "INTERNAL_SERVER_ERROR" : "REQUEST_ERROR"),
      message: err.message || "Internal server error",
      details: err.details || []
    },
    meta: {
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    }
  });
}
