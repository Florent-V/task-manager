import express from 'express';
import { authenticateByCookieSession } from '../middleware/authMiddleware.js';
import { generateToDoList } from '../controllers/aiController.js';

const router = express.Router();

router.post('/generate-todolist', authenticateByCookieSession, generateToDoList);

export default router;
