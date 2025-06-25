import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  addRoleUser,
  removeRoleUser,
  getConnectedUser,
  updateConnectedUser,
} from '../controllers/userController.js';
import {
  authenticateByCookieSession,
  isAdmin,
  isModeratorOrAdmin,
} from '../middleware/authMiddleware.js';
import { setUpdateUserValidator } from '../middleware/userMiddleware.js';
import { validate } from '../middleware/ressourceMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

/** @type {import('express').Router} */
const router = Router();

router.use(authenticateByCookieSession);

// GET /user - Récupération de tous les Utilisateurs
router.get('/', isModeratorOrAdmin, getAllUsers);

// GET /user/me - Récupération de l'utilisateur connecté
router.get('/me', getConnectedUser);

// PATCH /user/me - Mise à jour de l'utilisateur connecté
router.patch('/me', upload.single('image'), updateConnectedUser);

// GET /user/:id - Récupération d'un Utilisateur
router.get('/:id', isModeratorOrAdmin, getUserById);

// PATCH /user/:id - Mise à jour d'un Utilisateur
router.patch('/:id', isAdmin, setUpdateUserValidator, validate, updateUser);

// POST /user/:userId/role/:roleId - Ajout d'un role a un utilisateur
router.post('/:userId/role/:roleId', isAdmin, addRoleUser);

// DELETE /user/:userId/role/:roleId - Suppression d'un role d'un utilisateur
router.delete('/:userId/role/:roleId', isAdmin, removeRoleUser);

// DELETE /user/:id - Suppression d'un Utilisateur
router.delete('/:id', isAdmin, deleteUser);

export default router;
