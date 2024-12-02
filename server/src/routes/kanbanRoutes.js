import express from 'express';
import { createKanban, getKanbanById, getKanbansByUser, updateKanban, deleteKanban } from '../controllers/kanbanController.js';
import { authorizeManyToManyRessourceAccess } from "../middleware/ressourceMiddleware.js";
import { authenticateByCookieSession } from "../middleware/authMiddleware.js";
import { setKanbanEntity, setKanbanCreateValidator, setKanbanUpdateValidator } from "../middleware/kanbanMiddleware.js";

const router = express.Router();

const getKanbanAndCheckAccess = [
  getKanbanById,
  authorizeManyToManyRessourceAccess
];

router.use(authenticateByCookieSession);
router.use(setKanbanEntity);


router.get('/', getKanbansByUser);
router.post('/', createKanban);
router.put('/:id', updateKanban);
router.delete('/:id', deleteKanban);

export default router;
