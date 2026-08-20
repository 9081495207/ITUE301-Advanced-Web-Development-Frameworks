/**
 * Supplementary Middleware 2: Route-specific Task ID Validator
 * Validates that the route parameter :id is a positive integer before reaching controllers.
 */
const validateTaskId = (req, res, next) => {
  const { id } = req.params;
  const numericId = Number(id);

  if (!id || isNaN(numericId) || !Number.isInteger(numericId) || numericId <= 0) {
    return res.status(400).json({
      status: 400,
      error: "Bad Request",
      message: `Invalid Task ID '${id}'. Task ID must be a positive integer.`
    });
  }

  req.taskId = numericId;
  next();
};

module.exports = validateTaskId;
