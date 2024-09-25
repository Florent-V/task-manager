import express from 'express';
import todoitemRoutes from './toDoItemRoutes.js';
import { createToDoList, getAllToDoLists, getToDoListById, updateToDoList, deleteToDoList } from '../controllers/toDoListController.js';
import { authenticateByCookieSession, isAdmin } from '../middleware/authMiddleware.js';
import { setEntity, setCreateValidator, setUpdateValidator } from '../middleware/toDoListMiddleware.js';
import { getUserRessources, getUserRessourceById, authorizeRessourceAccess, validator } from '../middleware/ressourceMiddleware.js';

const router = express.Router();

const getToDoListAndCheckAccess = [
  getToDoListById,
  authorizeRessourceAccess
];

router.use(authenticateByCookieSession);
router.use(setEntity);

router.post('/', setCreateValidator, validator, createToDoList);

router.get('/', getUserRessources);
router.get('/all', isAdmin, getAllToDoLists);

router.get('/:id', getUserRessourceById);

router.use('/:id', getToDoListAndCheckAccess);
router.patch('/:id', setUpdateValidator, validator, updateToDoList);
router.delete('/:id', deleteToDoList);

router.use('/:id/todoitem', todoitemRoutes);

export default router;
