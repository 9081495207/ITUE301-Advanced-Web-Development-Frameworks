const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const { JWT_SECRET } = require('../middleware/authMiddleware');

/**
 * Generate JWT token for user ID
 */
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '1h' });
};

/**
 * @route   POST /auth/register
 * @desc    Register a new user, hash password, return token
 * @access  Public
 */
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({
        status: 400,
        error: 'User Already Exists',
        message: `An account with email '${email}' is already registered.`
      });
    }

    // Hash password with bcrypt cost factor 10
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in MongoDB
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword
    });

    const token = generateToken(user._id);

    res.status(201).json({
      status: 201,
      message: 'User registered successfully.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /auth/login
 * @desc    Authenticate user, verify password hash, return JWT token
 * @access  Public
 */
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({
        status: 401,
        error: 'Invalid Credentials',
        message: 'Invalid email address or password.'
      });
    }

    // Verify password with bcrypt.compare
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        status: 401,
        error: 'Invalid Credentials',
        message: 'Invalid email address or password.'
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      status: 200,
      message: 'Login successful.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /auth/me
 * @desc    Return details of currently authenticated user from decoded JWT (Supplementary #1)
 * @access  Private
 */
const getMe = async (req, res) => {
  res.status(200).json({
    status: 200,
    user: req.user
  });
};

module.exports = {
  registerUser,
  loginUser,
  getMe
};
