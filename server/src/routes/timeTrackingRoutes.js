import express from 'express';
import { authenticateByCookieSession } from '../middleware/authMiddleware.js';
import { getImputationsForUser } from '../controllers/imputationController.js';
import { exportUserTimeTrackingReport } from '../controllers/excelExportController.js';

const router = express.Router();

// Route to get all imputations for a specific User
router.get('/me', authenticateByCookieSession, getImputationsForUser);

router.get('/user-report/export', authenticateByCookieSession, exportUserTimeTrackingReport);

export default router;
