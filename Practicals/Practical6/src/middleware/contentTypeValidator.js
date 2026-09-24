const validateContentType = (req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(400).json({
        status: 400,
        error: 'Bad Request',
        message: "Header 'Content-Type' must be 'application/json' for request body operations."
      });
    }
  }
  next();
};

module.exports = validateContentType;
