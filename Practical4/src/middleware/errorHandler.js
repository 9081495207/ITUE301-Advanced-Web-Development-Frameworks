/**
 * Global Error Handling Middleware
 * Must be registered last with 4 arguments (err, req, res, next).
 * Logs error stack trace and returns a 500 status code with structured JSON.
 */
const globalErrorHandler = (err, req, res, next) => {
  console.error("🔥 [Global Error Handler]:", err.stack || err.message || err);
  
  res.status(500).json({
    status: 500,
    error: "Internal Server Error",
    message: err.message || "Something went wrong on the server."
  });
};

module.exports = globalErrorHandler;
