import express from 'express';
import {
  setStageEntity,
  setStageCreateValidator,
  setStageUpdateValidator,
  isStageInKanban
} from '../middleware/stageMiddleware.js';
import { validate } from '../middleware/ressourceMiddleware.js';
import {
  createStage,
  getAllStagesByKanban,
  getStageById,
  updateStage,
  deleteStage
} from '../controllers/stageController.js';

const router = express.Router({ mergeParams: true });

router.post('/', setStageCreateValidator, validate, createStage);

router.get('/', getAllStagesByKanban);

router.use('/:stageId', isStageInKanban);
router.get('/:stageId', getStageById);
router.patch('/:stageId', setStageUpdateValidator, validate, updateStage);
router.delete('/:stageId', deleteStage);

export default router;