import express from 'express';
import toDoItemRoutes from './toDoItemRoutes.js';
import {
  createToDoList,
  getAllToDoLists,
  getAllToDoListsByUser,
  getToDoListById,
  updateToDoList,
  shareToDoList,
  joinToDoList
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
import ToDoList from '../models/toDoListModel.js';
import NotFoundError from '../error/notFoundError.js';
import User from '../models/userModel.js';

const router = express.Router();

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
// router.post('/:id/share', getToDoListAndCheckAccess, async (req, res, next) => {
//   try {
//         const { id } = req.params;
//         const { email } = req.body;
//
//         const toDoList = await ToDoList.findByPk(id);
//         if (!toDoList) throw new NotFoundError('ToDoList Not Found');
//
//         const user = await User.findOne({ where: { email } });
//         if (!user) throw new NotFoundError('User Not Found');
//
//         await toDoList.addUsers([user.id]);
//
//         res.data.toDoList = toDoList;
//     next();
//   } catch (error) {
//     return next(error);
//   }
// }
router.post('/:id/share', getToDoListAndCheckAccess, shareToDoList);

// join todolist
router.post('/:id/join', getToDoListById, joinToDoList);

router.use('/:id/todoitem', getToDoListAndCheckAccess, toDoItemRoutes);

export default router;
