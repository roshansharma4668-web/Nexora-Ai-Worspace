const express = require('express');
const {
  getMyWorkspaces,
  getWorkspaceById,
  createWorkspace,
  getWorkspaceMembers
} = require('../controllers/workspaceController');
const { getMyAssignedTasks } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { verifyWorkspaceAccess } = require('../middleware/workspaceMiddleware');
const validate = require('../middleware/validateMiddleware');
const { createWorkspaceSchema } = require('../validators/workspaceValidator');

const router = express.Router();

router.use(protect);

router.get('/', getMyWorkspaces);
router.post('/', validate(createWorkspaceSchema), createWorkspace);
router.get('/:workspaceId', verifyWorkspaceAccess(), getWorkspaceById);
router.get('/:workspaceId/tasks/my-tasks', verifyWorkspaceAccess(), getMyAssignedTasks);
router.get('/:workspaceId/members', verifyWorkspaceAccess(), getWorkspaceMembers);

module.exports = router;