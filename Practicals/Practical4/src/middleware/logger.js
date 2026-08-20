/**
 * Request Logging Middleware
 * Logs HTTP method, URL, and ISO timestamp for every incoming request.
 */
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[LOG] ${req.method} ${req.originalUrl || req.url} - ${timestamp}`);
  next();
};

module.exports = requestLogger;
