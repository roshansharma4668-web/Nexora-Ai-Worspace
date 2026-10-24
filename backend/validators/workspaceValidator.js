const { z } = require('zod');

const createWorkspaceSchema = z.object({
  name: z.string().min(2, 'Workspace name must be at least 2 characters long'),
  description: z.string().optional()
});

const updateWorkspaceSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional()
});

module.exports = {
  createWorkspaceSchema,
  updateWorkspaceSchema
};