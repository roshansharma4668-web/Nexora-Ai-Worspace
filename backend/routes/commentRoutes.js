const express = require('express');
const { getCommentsByTask, createComment } = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');
const { verifyWorkspaceAccess } = require('../middleware/workspaceMiddleware');
const validate = require('../middleware/validateMiddleware');
const { z } = require('zod');

const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty')
});

const router = express.Router({ mergeParams: true });

router.use(protect, verifyWorkspaceAccess());

router.get('/', getCommentsByTask);
router.post('/', validate(commentSchema), createComment);

module.exports = router;