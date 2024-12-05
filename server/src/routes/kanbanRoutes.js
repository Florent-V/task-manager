import express from 'express';
import stageRoutes from './stageRoutes.js';
import { createKanban, getAllKanbans, getKanbanById, getKanbansByUser, updateKanban } from '../controllers/kanbanController.js';
import { authorizeManyToManyRessourceAccess, validate } from "../middleware/ressourceMiddleware.js";
import { authenticateByCookieSession, isAdmin } from "../middleware/authMiddleware.js";
import { setKanbanEntity, setKanbanCreateValidator, setKanbanUpdateValidator } from "../middleware/kanbanMiddleware.js";
import { remove } from "../middleware/basicCrudMiddleware.js";


const router = express.Router();

const getKanbanAndCheckAccess = [
  getKanbanById,
  authorizeManyToManyRessourceAccess
];

router.use(authenticateByCookieSession);
router.use(setKanbanEntity);

router.get('/', getKanbansByUser);
router.post('/', setKanbanCreateValidator, validate, createKanban);

router.get('/all', isAdmin, getAllKanbans);
router.get('/:id', getKanbanAndCheckAccess);

router.patch('/:id', getKanbanAndCheckAccess, setKanbanUpdateValidator, validate, updateKanban, getKanbanById);
router.delete('/:id', getKanbanAndCheckAccess, remove);



router.use('/:id/stage', getKanbanAndCheckAccess, stageRoutes);

export default router;
