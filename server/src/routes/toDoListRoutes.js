import express from 'express';
import toDoItemRoutes from './toDoItemRoutes.js';
import { createToDoList, getAllToDoLists, getAllToDoListsByUser, getToDoListById, updateToDoList, deleteToDoList } from '../controllers/toDoListController.js';
import { authenticateByCookieSession, isAdmin } from '../middleware/authMiddleware.js';
import { setEntity, setCreateValidator, setUpdateValidator } from '../middleware/toDoListMiddleware.js';
import { authorizeManyToManyRessourceAccess, validator } from '../middleware/ressourceMiddleware.js';

const router = express.Router();

const getToDoListAndCheckAccess = [
  getToDoListById,
  authorizeManyToManyRessourceAccess
];

router.use(authenticateByCookieSession);
router.use(setEntity);

router.post('/', setCreateValidator, validator, createToDoList);
router.get('/', getAllToDoListsByUser);

router.get('/all', isAdmin, getAllToDoLists);

router.get('/:id', getToDoListAndCheckAccess);
router.patch('/:id', getToDoListAndCheckAccess, setUpdateValidator, validator, updateToDoList);
router.delete('/:id', getToDoListAndCheckAccess, deleteToDoList);

router.use('/:id/todoitem', toDoItemRoutes);

export default router;
