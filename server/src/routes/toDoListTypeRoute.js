import express from 'express';
import { createToDoListType, getAllToDoListTypes, getToDoListTypeById, updateToDoListType, deleteToDoListType } from '../controllers/toDoListTypeController.js';
import { isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(isAdmin);
router.post('/', createToDoListType);
router.get('/', getAllToDoListTypes);
router.get('/:id', getToDoListTypeById);
router.put('/:id', updateToDoListType);
router.delete('/:id', deleteToDoListType);

export default router;
