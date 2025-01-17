import express from 'express';
import commentRoutes from './commentRoutes.js';
import {
  isTaskInKanban,
  setTaskEntity,
  setTaskCreateValidator,
  setTaskUpdateValidator,
  checkTaskRelationship
} from '../middleware/taskMiddleware.js';
import { validate } from '../middleware/ressourceMiddleware.js';
import {
  createTask,
  getAllTasksByKanban,
  getTaskById,
  updateTask,
  deleteTask
} from '../controllers/taskController.js';

const router = express.Router({ mergeParams: true });

router.post('/', setTaskCreateValidator, validate, checkTaskRelationship, createTask);

router.get('/', getAllTasksByKanban);

router.use('/:taskId', isTaskInKanban);
router.get('/:taskId', getTaskById);
router.patch('/:taskId', setTaskUpdateValidator, validate, checkTaskRelationship, updateTask);
router.delete('/:taskId', deleteTask);

router.use('/:taskId/comment', commentRoutes);

export default router;