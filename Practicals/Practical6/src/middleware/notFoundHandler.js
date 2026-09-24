const notFoundHandler = (req, res) => {
  res.status(404).json({
    status: 404,
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}. Resource route does not exist.`
  });
};

module.exports = notFoundHandler;
