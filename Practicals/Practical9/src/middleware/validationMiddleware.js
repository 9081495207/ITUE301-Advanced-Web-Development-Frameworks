/**
 * Validation Middleware Module for Practical 9
 * Server-side request body validation and sanitization.
 */

const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body || {};
  const errors = [];

  if (!name || typeof name !== 'string' || !name.trim()) {
    errors.push('Name is required');
  }

  if (!email || typeof email !== 'string' || !email.trim()) {
    errors.push('Valid email address is required');
  } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
    errors.push('Email format is invalid');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: 400,
      error: 'Bad Request',
      message: 'Validation failed: ' + errors.join(', '),
      errors
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body || {};
  const errors = [];

  if (!email || typeof email !== 'string' || !email.trim()) {
    errors.push('Email address is required');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: 400,
      error: 'Bad Request',
      message: 'Validation failed: ' + errors.join(', '),
      errors
    });
  }

  next();
};

const validateTask = (req, res, next) => {
  if (req.method === 'POST') {
    const { title, priority } = req.body || {};

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({
        status: 400,
        error: 'Bad Request',
        message: 'Task title is required and cannot be empty'
      });
    }

    if (priority && !['low', 'medium', 'high'].includes(priority.toLowerCase())) {
      return res.status(400).json({
        status: 400,
        error: 'Bad Request',
        message: 'Priority must be one of: low, medium, high'
      });
    }
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateTask
};
