const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const taskController = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

const validateTask = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'completed']).withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
  body('category')
    .optional()
    .isIn(['Work', 'Personal', 'Study', 'Health', 'Finance', 'Shopping', 'Other'])
    .withMessage('Invalid category'),
  body('dueDate')
    .optional({ nullable: true })
    .isISO8601().withMessage('Invalid date format'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }
    next();
  }
];

router.use(protect);
router.get('/stats', taskController.getStats);
router.get('/', taskController.getTasks);
router.get('/:id', taskController.getTask);
router.post('/', validateTask, taskController.createTask);
router.put('/:id', validateTask, taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;