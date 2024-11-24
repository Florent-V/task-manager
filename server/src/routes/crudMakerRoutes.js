import { create, getAll, getById, remove, update } from "../middleware/basicCrudMiddleware.js";
import { validate } from '../middleware/ressourceMiddleware.js';
import { isAdmin } from '../middleware/authMiddleware.js';

export const makeCrudRoutes = (router, {
  setEntity,
  setCreateValidator,
  setUpdateValidator,
}) => {
  router.use(setEntity);
  router.get('/', getAll);
  router.get('/:id', getById);
  router.post('/', isAdmin, setCreateValidator, validate, create);
  router.patch('/:id', isAdmin, setUpdateValidator, validate, update);
  router.delete('/:id', isAdmin, remove);

  return router;
};
