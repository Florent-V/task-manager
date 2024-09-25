import express from 'express';
import { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct } from '../controllers/productController.js';
import { authenticateByCookieSession, isAdmin } from '../middleware/authMiddleware.js';
import { setEntity, setCreateValidator, setUpdateValidator } from '../middleware/productMiddleware.js';
import { getUserRessources, getUserRessourceById, authorizeRessourceAccess, validator } from '../middleware/ressourceMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(authenticateByCookieSession);
router.use(setEntity);

router.post('/', upload.single('image'), setCreateValidator, validator, createProduct);

router.get('/', getUserRessources);
router.get('/all', isAdmin, getAllProducts);
router.get('/:id', getUserRessourceById);

router.patch('/:id', getProductById, authorizeRessourceAccess, upload.single('image'), setUpdateValidator, validator, updateProduct);
router.delete('/:id', getProductById, authorizeRessourceAccess, deleteProduct);

export default router;
