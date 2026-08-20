/**
 * Supplementary Middleware 3: 404 Undefined Route Handler
 * Catches any request to unregistered endpoints and returns a structured JSON response.
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    status: 404,
    error: "Not Found",
    message: `Cannot ${req.method} ${req.originalUrl || req.url}. Route does not exist.`
  });
};

module.exports = notFoundHandler;
