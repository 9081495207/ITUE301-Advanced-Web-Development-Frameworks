const mongoose = require('mongoose');

/**
 * Task Mongoose Schema for Practical 7 (Scoped to User ObjectId)
 * Fields:
 * - user: ObjectId reference to User schema
 * - title: String (required, trimmed)
 * - description: String (optional, trimmed)
 * - completed: Boolean (default: false)
 * - priority: String enum ('low', 'medium', 'high', default: 'medium')
 */
const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task must belong to an authenticated User']
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    completed: {
      type: Boolean,
      default: false
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'],
        message: 'Priority must be either low, medium, or high'
      },
      default: 'medium',
      lowercase: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Task', taskSchema);
