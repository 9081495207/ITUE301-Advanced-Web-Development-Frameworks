const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url} - IP: ${req.ip || '127.0.0.1'}`);
  next();
};

module.exports = requestLogger;
