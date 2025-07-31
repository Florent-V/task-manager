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
import {
  getImputationsForKanban,
  getKanbanImputationTotals,
  getTasksSummaryForKanbanPaginated,
  getDetailedImputationsForKanbanPaginated,
} from '../controllers/imputationController.js';
import { exportKanbanImputationReport } from '../controllers/excelExportController.js';

/** @type {import('express').Router} */
const router = Router();

const getKanbanAndCheckAccess = [getKanbanById, authorizeManyToManyRessourceAccess];

router.use(authenticateByCookieSession);
router.use(setKanbanEntity);

// GET /kanban - Récupération de tous les Kanbans
router.get('/', getKanbansByUser);

// POST /kanban - Création d'un Kanban
router.post('/', setKanbanCreateValidator, validate, createKanban);

// GET /kanban/all - Récupération de tous les Kanbans
router.get('/all', isAdmin, getAllKanbans);

// POST /kanban/:id/join - Join a kanban
router.post('/:id/join', getKanbanById, joinKanban);

router.use('/:id', getKanbanAndCheckAccess);

// GET /kanban/:id - Récupération d'un Kanban
router.get('/:id/');

// PATCH /kanban/:id - Modification d'un Kanban
router.patch('/:id', setKanbanUpdateValidator, validate, updateKanban, getKanbanById);

// DELETE /kanban/:id - Suppression d'un Kanban
router.delete('/:id', remove);

// GET /kanban/:id/imputations/totals - Récupération des totaux globaux pour le rapport d'imputation
router.get('/:id/imputations/totals', getKanbanImputationTotals);

// GET /kanban/:id/imputations/tasks-summary - Récupération du résumé des tâches paginé
router.get('/:id/imputations/tasks-summary', getTasksSummaryForKanbanPaginated);

// GET /kanban/:id/imputations/detailed-list - Récupération de la liste détaillée des imputations paginée
router.get('/:id/imputations/detailed-list', getDetailedImputationsForKanbanPaginated);

// GET /kanban/:id/imputation-report/export - Export detailed imputations for a Kanban
router.get('/:id/imputation-report/export', exportKanbanImputationReport);

// GET /kanban/:id/imputations - Récupération des imputations d'un Kanban
router.get('/:id/imputations', getImputationsForKanban);

// POST /kanban/:id/share - Share kanban
router.post('/:id/share', shareKanban);

// POST /kanban/:id/share-email - Share kanban by email
router.post('/:id/share-email', shareKanbanByEmail);

// POST /kanban/:id/add-member - Add member by mail
router.post('/:id/add-member', addMemberByMail);

// POST /kanban/:id/leave - Leave kanban
router.post('/:id/leave', leaveKanban);

// USE /kanban/:id/task - Gestion des taches
router.use('/:id/task', taskRoutes);

// USE /kanban/:id/stage - Gestion des stages
router.use('/:id/stage', stageRoutes);

export default router;
