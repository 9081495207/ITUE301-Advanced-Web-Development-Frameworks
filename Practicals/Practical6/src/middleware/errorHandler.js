const globalErrorHandler = (err, req, res, next) => {
  console.error("🔥 [Global Error Handler]:", err.name, err.message);

  if (err.name === 'ValidationError') {
    const details = Object.keys(err.errors).map((key) => ({
      field: key,
      message: err.errors[key].message
    }));

    const mainMessage = details.map((d) => d.message).join(' ');

    return res.status(400).json({
      status: 400,
      error: 'Validation Error',
      message: mainMessage || 'Task schema validation failed.',
      details: details
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      status: 400,
      error: 'Cast Error',
      message: `Invalid format for field '${err.path}': '${err.value}'.`
    });
  }

  res.status(500).json({
    status: 500,
    error: 'Internal Server Error',
    message: err.message || 'Something went wrong on the server.'
  });
};

module.exports = globalErrorHandler;
