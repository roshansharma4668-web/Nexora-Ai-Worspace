const { z } = require('zod');

const generatePlanSchema = z.object({
  description: z.string().min(5, 'Please provide a detailed project description (at least 5 characters)')
});

const confirmTasksSchema = z.object({
  tasks: z.array(
    z.object({
      title: z.string().min(2),
      description: z.string().optional(),
      priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).optional(),
      estimatedHours: z.number().min(0).optional(),
      labels: z.array(z.string()).optional()
    })
  ).min(1, 'At least one task must be selected')
});

module.exports = {
  generatePlanSchema,
  confirmTasksSchema
};