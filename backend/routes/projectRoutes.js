const express = require('express');
const {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const { verifyWorkspaceAccess } = require('../middleware/workspaceMiddleware');
const validate = require('../middleware/validateMiddleware');
const { createProjectSchema, updateProjectSchema } = require('../validators/projectValidator');

const router = express.Router({ mergeParams: true });

router.use(protect, verifyWorkspaceAccess());

router.get('/', getProjects);
router.post('/', validate(createProjectSchema), createProject);
router.get('/:projectId', getProjectById);
router.patch('/:projectId', validate(updateProjectSchema), updateProject);
router.delete('/:projectId', deleteProject);

module.exports = router;