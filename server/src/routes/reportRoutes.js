import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import {
  getImputationsForKanban,
  getImputationsForUser,
} from '../controllers/imputationController.js';
// Removed inOutMiddleware import as it's handled globally in app.js

const router = express.Router();

// Route to get all imputations for a specific Kanban
router.get(
  '/kanbans/:kanbanId/imputations-report',
  verifyToken,
  getImputationsForKanban
  // inOutMiddleware is handled globally by app.js after controller calls next()
);

// Route to get all imputations for a specific User
router.get(
  '/users/:userId/imputations-report',
  verifyToken,
  getImputationsForUser
  // inOutMiddleware is handled globally by app.js after controller calls next()
);

export default router;
