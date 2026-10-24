const WorkspaceMembership = require('../models/WorkspaceMembership');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const verifyWorkspaceAccess = (requiredRoles = []) => {
  return asyncHandler(async (req, res, next) => {
    const workspaceId = req.params.workspaceId || req.body.workspaceId || req.query.workspaceId;

    if (!workspaceId) {
      return next(new AppError('Workspace ID is required for authorization check.', 400));
    }

    const membership = await WorkspaceMembership.findOne({
      workspaceId,
      userId: req.user._id
    });

    if (!membership) {
      return next(new AppError('Access denied. You are not a member of this workspace.', 403));
    }

    if (requiredRoles.length > 0 && !requiredRoles.includes(membership.role)) {
      return next(new AppError(`Access denied. Required workspace role: ${requiredRoles.join(' or ')}`, 403));
    }

    req.workspaceMembership = membership;
    next();
  });
};

module.exports = { verifyWorkspaceAccess };