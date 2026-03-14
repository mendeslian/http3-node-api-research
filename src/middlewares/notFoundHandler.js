function notFoundHandler(req, res) {
  res.status(404).json({
    error: 'NotFound',
    path: req.originalUrl,
  });
}

export { notFoundHandler };
