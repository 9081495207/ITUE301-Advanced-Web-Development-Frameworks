const jwt = require('jsonwebtoken');
const User = require('../../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'practical7_jwt_secret_key_987654';

/**
 * Authentication Middleware for Practical 7
 * Verifies JWT token from 'Authorization: Bearer <token>' header.
 * Attaches decoded user object to `req.user`.
 */
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      status: 401,
      error: 'Unauthorized Access',
      message: 'Authentication token missing. Please log in to obtain access.'
    });
  }

  try {
    // 1. Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // 2. Retrieve user from MongoDB (excluding password)
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        status: 401,
        error: 'Unauthorized Access',
        message: 'The user belonging to this token no longer exists.'
      });
    }

    // 3. Attach user to request
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 401,
        error: 'Token Expired',
        message: 'Your session token has expired. Please log in again.'
      });
    }

    return res.status(401).json({
      status: 401,
      error: 'Invalid Token',
      message: 'Token verification failed. Invalid or malformed signature.'
    });
  }
};

module.exports = { protect, JWT_SECRET };
