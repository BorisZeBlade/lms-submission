function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} was not found.`,
  });
}

function errorHandler(error, req, res, next) {
  console.error(error);
  res.status(500).json({
    success: false,
    message: 'Internal server error.',
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
