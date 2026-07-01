const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: ''
    },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'completed'],
      default: 'todo'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    category: {
      type: String,
      enum: ['Work', 'Personal', 'Study', 'Health', 'Finance', 'Shopping', 'Other'],
      default: 'Other'
    },
    dueDate: {
      type: Date,
      default: null
    },
    tags: {
      type: [String],
      default: []
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

taskSchema.index({ status: 1, priority: 1 });
taskSchema.index({ createdAt: -1 });
taskSchema.index({ user: 1 });

module.exports = mongoose.model('Task', taskSchema);