/**
 * Supplementary Middleware 1: Content-Type Header Validator
 * Rejects POST and PUT requests without Content-Type: application/json header.
 */
const validateContentType = (req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(415).json({
        status: 415,
        error: "Unsupported Media Type",
        message: "POST and PUT requests require 'Content-Type: application/json' header."
      });
    }
  }
  next();
};

module.exports = validateContentType;
