import express from 'express';
import {
  createImputation,
  getImputationsForTask,
  updateImputation,
  deleteImputation
} from '../controllers/imputationController.js';
import {
  setImputationEntity,
  setImputationCreateValidator,
  setImputationUpdateValidator,
  checkImputationAccess,
} from '../middleware/imputationMiddleware.js';
import { validate } from '../middleware/ressourceMiddleware.js';

const router = express.Router({ mergeParams: true });

router.use(setImputationEntity);
// POST /tasks/:taskId/imputations - Create a new imputation for a task
router.post('/', setImputationCreateValidator, validate, createImputation);

// GET /tasks/:taskId/imputations - Get all imputations for a specific task
router.get('/', getImputationsForTask);

// PUT /tasks/:taskId/imputations/:imputationId - Update a specific imputation
router.patch('/:imputationId', checkImputationAccess, setImputationUpdateValidator, validate, updateImputation);

// DELETE /tasks/:taskId/imputations/:imputationId - Delete a specific imputation
router.delete('/:imputationId', checkImputationAccess, deleteImputation);

export default router;