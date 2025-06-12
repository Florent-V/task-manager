import express from 'express';
import commentRoutes from './commentRoutes.js';
import imputationRoutes from './imputationRoutes.js';
import {
  isTaskInKanban,
  setTaskEntity,
  setTaskCreateValidator,
  setTaskUpdateValidator,
  checkTaskRelationship, setStageTaskUpdateValidator,
} from '../middleware/taskMiddleware.js';
import { validate } from '../middleware/ressourceMiddleware.js';
import {
  createTask,
  getAllTasksByKanban,
  getTaskById,
  updateTask,
  deleteTask,
  updateStageTask,
} from '../controllers/taskController.js';

const router = express.Router({ mergeParams: true });

router.use(setTaskEntity);
router.post('/', setTaskCreateValidator, validate, checkTaskRelationship, createTask);

router.get('/', getAllTasksByKanban);

router.use('/:taskId', isTaskInKanban);
router.get('/:taskId', getTaskById);
router.patch('/:taskId', setTaskUpdateValidator, validate, checkTaskRelationship, updateTask);
router.patch(
  '/:taskId/stage',
  setStageTaskUpdateValidator,
  validate,
  checkTaskRelationship,
  updateStageTask
);
router.delete('/:taskId', deleteTask);

router.use('/:taskId/comment', commentRoutes);
router.use('/:taskId/imputations', imputationRoutes);

export default router;
