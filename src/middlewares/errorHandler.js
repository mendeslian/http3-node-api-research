function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err?.name === 'ZodError') {
    res.status(400).json({
      error: 'ValidationError',
      details: err.issues?.map((issue) => ({
        path: Array.isArray(issue.path) ? issue.path.join('.') : '',
        message: issue.message,
      })),
    });
    return;
  }

  const statusCode = Number(err?.statusCode ?? err?.status ?? 500);
  const message =
    statusCode >= 500 && process.env.NODE_ENV === 'production'
      ? 'InternalServerError'
      : err?.message || 'InternalServerError';

  if (req?.log?.error) {
    req.log.error({ err, statusCode }, 'erro_requisicao');
  }

  res.status(statusCode).json({ error: message });
}

export { errorHandler };
