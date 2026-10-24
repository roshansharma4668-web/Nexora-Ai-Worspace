const { z } = require('zod');

const createProjectSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters long'),
  description: z.string().optional(),
  status: z.enum(['Planning', 'Active', 'On Hold', 'Completed', 'Archived']).optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).optional(),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid deadline date format' }),
  members: z.array(z.string()).optional()
});

const updateProjectSchema = createProjectSchema.partial();

module.exports = {
  createProjectSchema,
  updateProjectSchema
};