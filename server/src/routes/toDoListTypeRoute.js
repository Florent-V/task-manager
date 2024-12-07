import express from 'express';
import { setEntity, setCreateValidator, setUpdateValidator } from '../middleware/toDoListTypeMiddleware.js';
import { makeCrudRoutes } from './crudMakerRoutes.js';

const router = express.Router();

makeCrudRoutes(router, {
  setEntity,
  setCreateValidator,
  setUpdateValidator,
});

export default router;
