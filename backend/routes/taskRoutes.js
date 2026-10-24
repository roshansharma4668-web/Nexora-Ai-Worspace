const express = require('express');
const {
  getTasksByProject,
  getMyAssignedTasks,
  createTask,
  updateTask,
  moveTaskStatus,
  deleteTask
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { verifyWorkspaceAccess } = require('../middleware/workspaceMiddleware');
const validate = require('../middleware/validateMiddleware');
const { createTaskSchema, updateTaskSchema, moveTaskSchema } = require('../validators/taskValidator');

const router = express.Router({ mergeParams: true });

router.use(protect, verifyWorkspaceAccess());

router.get('/my-tasks', getMyAssignedTasks);
router.get('/', getTasksByProject);
router.post('/', validate(createTaskSchema), createTask);
router.patch('/:taskId', validate(updateTaskSchema), updateTask);
router.patch('/:taskId/move', validate(moveTaskSchema), moveTaskStatus);
router.delete('/:taskId', deleteTask);

module.exports = router;