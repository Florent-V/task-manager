import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  addRoleUser,
  removeRoleUser,
  getConnectedUser,
  updateConnectedUser
} from '../controllers/userController.js';
import {
  authenticateByCookieSession,
  isAdmin,
  isModeratorOrAdmin
} from '../middleware/authMiddleware.js';
import { setUpdateUserValidator } from '../middleware/userMiddleware.js';
import { validate } from '../middleware/ressourceMiddleware.js';
import upload from "../middleware/uploadMiddleware.js";

/** @type {import('express').Router} */
const router = Router();

router.use(authenticateByCookieSession);

router.get('/', isModeratorOrAdmin, getAllUsers);

router.get('/me', getConnectedUser);
router.patch('/me', upload.single('image'), updateConnectedUser);

router.get('/:id', isModeratorOrAdmin, getUserById);
router.patch('/:id', isAdmin, setUpdateUserValidator, validate, updateUser);

router.post('/:userId/role/:roleId', isAdmin, addRoleUser);
router.delete('/:userId/role/:roleId', isAdmin, removeRoleUser);

router.delete('/:id', isAdmin, deleteUser);

export default router;