import express from 'express';
import { authenticateByCookieSession } from '../middleware/authMiddleware.js';
import { generateToDoList, organizeToDoList } from '../controllers/aiController.js';
import { authorizeManyToManyRessourceAccess } from '../middleware/ressourceMiddleware.js';
import { getToDoListById } from '../controllers/toDoListController.js';

const router = express.Router();

router.post('/generate-todolist', authenticateByCookieSession, generateToDoList);
router.post(
  '/organize-todolist/:id',
  authenticateByCookieSession,
  getToDoListById,
  authorizeManyToManyRessourceAccess,
  organizeToDoList
);

export default router;
