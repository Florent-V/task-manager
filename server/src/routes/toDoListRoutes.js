import { Router } from 'express';
import toDoItemRoutes from './toDoItemRoutes.js';
import {
  createToDoList,
  getAllToDoLists,
  getAllToDoListsByUser,
  getToDoListById,
  updateToDoList,
  shareToDoList,
  joinToDoList,
  addMemberByMail
} from '../controllers/toDoListController.js';
import {
  authenticateByCookieSession,
  isAdmin
} from '../middleware/authMiddleware.js';
import {
  setEntity,
  setCreateValidator,
  setUpdateValidator
} from '../middleware/toDoListMiddleware.js';
import {
  authorizeManyToManyRessourceAccess,
  validate
} from '../middleware/ressourceMiddleware.js';
import { remove } from '../middleware/basicCrudMiddleware.js';

/** @type {import('express').Router} */
const router = Router();

const getToDoListAndCheckAccess = [
  getToDoListById,
  authorizeManyToManyRessourceAccess
];

router.use(authenticateByCookieSession);
router.use(setEntity);

router.post('/', setCreateValidator, validate, createToDoList);
router.get('/', getAllToDoListsByUser);

router.get('/all', isAdmin, getAllToDoLists);

router.get('/:id', getToDoListAndCheckAccess);
router.patch('/:id', getToDoListAndCheckAccess, setUpdateValidator, validate, updateToDoList);
router.delete('/:id', getToDoListAndCheckAccess, remove);

// share todolist
router.post('/:id/share', getToDoListAndCheckAccess, shareToDoList);
// Add member by mail
router.post('/:id/add-member', getToDoListAndCheckAccess, addMemberByMail);
// join todolist
router.post('/:id/join', getToDoListById, joinToDoList);

router.use('/:id/todoitem', getToDoListAndCheckAccess, toDoItemRoutes);

export default router;
