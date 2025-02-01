import express from 'express';
import {
  setCreateValidator,
  setUpdateValidator,
  isToDoItemInToDoList
} from '../middleware/toDoItemMiddleware.js';
import { validate } from '../middleware/ressourceMiddleware.js';
import {
  createToDoItem,
  getToDoItems,
  getToDoItemById,
  updateToDoItem,
  deleteToDoItem
} from '../controllers/toDoItemController.js';
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router({ mergeParams: true });

router.post('/', upload.single('image'), setCreateValidator, validate, createToDoItem);

router.get('/', getToDoItems);

router.use('/:itemId', isToDoItemInToDoList);
router.get('/:itemId', getToDoItemById);
router.patch('/:itemId', upload.single('image'), setUpdateValidator, validate, updateToDoItem);
router.delete('/:itemId', deleteToDoItem);

export default router;
