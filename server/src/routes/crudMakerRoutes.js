import { create, getAll, getById, remove, update } from "../middleware/basicCrudMiddleware.js";
import { validate } from '../middleware/ressourceMiddleware.js';
import { isAdmin, authenticateByCookieSession } from '../middleware/authMiddleware.js';

const checkAdmin = [
  authenticateByCookieSession,
  isAdmin,
]

export const makeCrudRoutes = (router, {
  setEntity,
  setCreateValidator,
  setUpdateValidator,
}) => {
  router.use(setEntity);
  router.get('/', getAll);
  router.get('/:id', getById);
  router.post('/', checkAdmin, setCreateValidator, validate, create);
  router.patch('/:id', checkAdmin, setUpdateValidator, validate, update);
  router.delete('/:id', checkAdmin, remove);

  return router;
};
