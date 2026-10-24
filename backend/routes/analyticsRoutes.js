const express = require('express');
const { getWorkspaceOverview } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { verifyWorkspaceAccess } = require('../middleware/workspaceMiddleware');

const router = express.Router({ mergeParams: true });

router.use(protect, verifyWorkspaceAccess());
router.get('/overview', getWorkspaceOverview);

module.exports = router;