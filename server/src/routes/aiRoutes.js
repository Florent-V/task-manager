import express from 'express';
import { authenticateByCookieSession } from '../middleware/authMiddleware.js';
import { generateToDoList, organizeToDoList } from '../controllers/aiController.js';
import { authorizeManyToManyRessourceAccess } from '../middleware/ressourceMiddleware.js';
import { getToDoListById } from '../controllers/toDoListController.js';
import {
  setEntity,
} from '../middleware/toDoListMiddleware.js';

const router = express.Router();

router.post('/generate-todolist', authenticateByCookieSession, generateToDoList);
router.post(
  '/organize-todolist/:id',
  authenticateByCookieSession,
  setEntity,
  getToDoListById,
  authorizeManyToManyRessourceAccess,
  organizeToDoList
);

export default router;
