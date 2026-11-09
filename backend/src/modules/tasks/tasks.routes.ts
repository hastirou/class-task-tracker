import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { requireAuth, requireTeacher, requireStudent } from '../../middleware/auth.js';
import * as tasksController from './tasks.controller.js';
import { taskSchema, taskUpdateSchema, taskQuerySchema, taskParamsSchema } from './tasks.schemas.js';

const router = Router();

router.post('/', requireAuth, requireTeacher, validate(taskSchema), tasksController.create);
router.get('/', requireAuth, validate(taskQuerySchema, 'query'), tasksController.list);
router.get('/:id', requireAuth, validate(taskParamsSchema, 'params'), tasksController.getById);
router.put('/:id', requireAuth, requireTeacher, validate(taskParamsSchema, 'params'), validate(taskUpdateSchema), tasksController.update);
router.delete('/:id', requireAuth, requireTeacher, validate(taskParamsSchema, 'params'), tasksController.remove);
router.post('/:id/complete', requireAuth, requireStudent, validate(taskParamsSchema, 'params'), tasksController.complete);
router.delete('/:id/complete', requireAuth, requireStudent, validate(taskParamsSchema, 'params'), tasksController.uncomplete);

export default router;
