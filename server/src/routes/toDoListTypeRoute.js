import express from 'express';
import { createToDoListType, getAllToDoListTypes, getToDoListTypeById, updateToDoListType, deleteToDoListType } from '../controllers/toDoListTypeController.js';
import { isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllToDoListTypes);
router.get('/:id', getToDoListTypeById);

router.post('/', isAdmin, createToDoListType);
router.put('/:id', isAdmin, updateToDoListType);
router.delete('/:id', isAdmin, deleteToDoListType);

export default router;
