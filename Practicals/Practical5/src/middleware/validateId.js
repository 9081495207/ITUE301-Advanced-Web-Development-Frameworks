const mongoose = require('mongoose');

/**
 * Middleware: Validate MongoDB ObjectId format in route parameter (:id)
 */
const validateTaskId = (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 400,
      error: 'Invalid ID Format',
      message: `The provided ID '${id}' is not a valid 24-character hexadecimal MongoDB ObjectId.`
    });
  }

  req.taskId = id;
  next();
};

module.exports = validateTaskId;
