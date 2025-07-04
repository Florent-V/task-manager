import express from 'express';
import commentRoutes from './commentRoutes.js';
import imputationRoutes from './imputationRoutes.js';
import {
  isTaskInKanban,
  setTaskEntity,
  setTaskCreateValidator,
  setTaskUpdateValidator,
  checkTaskRelationship,
  setStageTaskUpdateValidator,
} from '../middleware/taskMiddleware.js';
import { validate } from '../middleware/ressourceMiddleware.js';
import {
  createTask,
  getAllTasksByKanban,
  getTaskById,
  updateTask,
  deleteTask,
  updateStageTask,
  archiveTask,
  restoreTask
} from '../controllers/taskController.js';

const router = express.Router({ mergeParams: true });

router.use(setTaskEntity);

// POST /kanban/:id/task - Create a new task
router.post('/', setTaskCreateValidator, validate, checkTaskRelationship, createTask);

// GET /kanban/:id/task - Get all tasks for a specific kanban
router.get('/', getAllTasksByKanban);

// USE /kanban/:id/task/:taskId
router.use('/:taskId', isTaskInKanban);

// GET /kanban/:id/task/:taskId - Get a specific task
router.get('/:taskId', getTaskById);

// PATCH /kanban/:id/task/:taskId - Update a specific task
router.patch('/:taskId', setTaskUpdateValidator, validate, checkTaskRelationship, updateTask);

// PATCH /kanban/:id/task/:taskId/stage - Update the stage of a specific task
router.patch(
  '/:taskId/stage',
  setStageTaskUpdateValidator,
  validate,
  checkTaskRelationship,
  updateStageTask
);

// PATCH /kanban/:id/task/:taskId/archive - Archive a specific task
router.patch('/:taskId/archive', archiveTask);

// PATCH /kanban/:id/task/:taskId/archive - Unarchive a specific task
router.patch('/:taskId/restore', restoreTask);

// DELETE /kanban/:id/task/:taskId - Delete a specific task
router.delete('/:taskId', deleteTask);

// USE /kanban/:id/task/:taskId/comment - Gestion des commentaires
router.use('/:taskId/comment', commentRoutes);

// USE /kanban/:id/task/:taskId/imputation - Gestion des imputations
router.use('/:taskId/imputation', imputationRoutes);

export default router;
