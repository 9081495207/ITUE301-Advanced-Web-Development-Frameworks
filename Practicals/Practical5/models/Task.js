const mongoose = require('mongoose');

/**
 * Task Schema Definition
 * Fields:
 *  - title: String (Required, trimmed)
 *  - description: String (Optional, trimmed, default empty string)
 *  - completed: Boolean (Default false)
 *  - createdAt: Date (Default Date.now)
 */
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required.'],
      trim: true,
      minlength: [1, 'Task title cannot be empty.']
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
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    versionKey: false // Exclude __v field in documents
  }
);

// Format JSON output to include 'id' field matching '_id' for client convenience
taskSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    return ret;
  }
});

module.exports = mongoose.model('Task', taskSchema);
