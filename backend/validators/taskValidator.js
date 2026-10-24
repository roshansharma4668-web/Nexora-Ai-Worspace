const { z } = require('zod');

const createTaskSchema = z.object({
  title: z.string().min(2, 'Task title must be at least 2 characters long'),
  description: z.string().optional(),
  status: z.enum(['Todo', 'In Progress', 'In Review', 'Completed']).optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).optional(),
  assigneeId: z.string().nullable().optional(),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid due date format' }),
  labels: z.array(z.string()).optional(),
  estimatedHours: z.number().min(0).optional()
});

const updateTaskSchema = createTaskSchema.partial();

const moveTaskSchema = z.object({
  status: z.enum(['Todo', 'In Progress', 'In Review', 'Completed']),
  order: z.number().optional()
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  moveTaskSchema
};