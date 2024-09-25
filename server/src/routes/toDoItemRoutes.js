import express from 'express';
import { setCreateValidator, setUpdateValidator, isToDoItemInToDoList } from '../middleware/toDoItemMiddleware.js'; 
import { validator } from '../middleware/ressourceMiddleware.js';
import { createToDoItem, getToDoItems, getToDoItemById, updateToDoItem, deleteToDoItem } from '../controllers/toDoItemController.js';

const router = express.Router({ mergeParams: true });

router.post('/', setCreateValidator, validator, createToDoItem);

router.get('/', getToDoItems);

router.use('/:itemId', isToDoItemInToDoList);
router.get('/:itemId', getToDoItemById);
router.patch('/:itemId', setUpdateValidator, validator, updateToDoItem);
router.delete('/:itemId', deleteToDoItem);

export default router;
