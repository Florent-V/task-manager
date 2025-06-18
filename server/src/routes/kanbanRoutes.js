import { Router } from 'express';
import stageRoutes from './stageRoutes.js';
import taskRoutes from './taskRoutes.js';
import {
  createKanban,
  getAllKanbans,
  getKanbanById,
  getKanbansByUser,
  updateKanban,
  shareKanban,
  shareKanbanByEmail,
  addMemberByMail,
  joinKanban,
  leaveKanban,
} from '../controllers/kanbanController.js';
import { authorizeManyToManyRessourceAccess, validate } from '../middleware/ressourceMiddleware.js';
import { authenticateByCookieSession, isAdmin } from '../middleware/authMiddleware.js';
import {
  setKanbanEntity,
  setKanbanCreateValidator,
  setKanbanUpdateValidator,
} from '../middleware/kanbanMiddleware.js';
import { remove } from '../middleware/basicCrudMiddleware.js';

/** @type {import('express').Router} */
const router = Router();

const getKanbanAndCheckAccess = [getKanbanById, authorizeManyToManyRessourceAccess];

router.use(authenticateByCookieSession);
router.use(setKanbanEntity);

router.get('/', getKanbansByUser);
router.post('/', setKanbanCreateValidator, validate, createKanban);

router.get('/all', isAdmin, getAllKanbans);

// join kanban
router.post('/:id/join', getKanbanById, joinKanban);

router.use('/:id', getKanbanAndCheckAccess);
router.get('/:id/');

router.patch('/:id', setKanbanUpdateValidator, validate, updateKanban, getKanbanById);
router.delete('/:id', remove);
// stage routes
router.post('/:id/stage', stageRoutes);
// share kanban
router.post('/:id/share', shareKanban);
// Share kanban by email
router.post('/:id/share-email', shareKanbanByEmail);
// Add member by mail
router.post('/:id/add-member', addMemberByMail);
// leave kanban
router.post('/:id/leave', leaveKanban);
// task routes
router.use('/:id/task', taskRoutes);

export default router;
