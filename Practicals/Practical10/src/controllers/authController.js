const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/authMiddleware');

/**
 * Generate JWT Token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });
};

/**
 * @route   POST /auth/register
 * @desc    Register new user
 * @access  Public
 */
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        status: 400,
        error: 'Bad Request',
        message: 'Please provide name, email, and password'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        status: 400,
        error: 'Bad Request',
        message: 'A user with this email address already exists'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword
    });

    const token = generateToken(user._id);

    res.status(201).json({
      status: 201,
      message: 'User registered successfully',
      token,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /auth/login
 * @desc    Authenticate user & return JWT token
 * @access  Public
 */
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 400,
        error: 'Bad Request',
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        status: 401,
        error: 'Unauthorized',
        message: 'Invalid email or password'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        status: 401,
        error: 'Unauthorized',
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      status: 200,
      message: 'Login successful',
      token,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /auth/me
 * @desc    Get currently authenticated user details
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      status: 200,
      data: req.user
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { registerUser, loginUser, getMe };
