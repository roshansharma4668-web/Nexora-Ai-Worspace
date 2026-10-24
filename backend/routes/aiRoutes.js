const express = require('express');
const { checkAiStatus, generatePlan, confirmAndSaveTasks } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const { verifyWorkspaceAccess } = require('../middleware/workspaceMiddleware');
const validate = require('../middleware/validateMiddleware');
const { generatePlanSchema, confirmTasksSchema } = require('../validators/aiValidator');

const router = express.Router({ mergeParams: true });

router.use(protect, verifyWorkspaceAccess());

router.get('/status', checkAiStatus);
router.post('/generate-plan', validate(generatePlanSchema), generatePlan);
router.post('/projects/:projectId/confirm-tasks', validate(confirmTasksSchema), confirmAndSaveTasks);

module.exports = router;