const mongoose = require('mongoose');

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
