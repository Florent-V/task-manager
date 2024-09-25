import Product from "../models/productModel.js";
import { productSchema, updateProductSchema } from "../joiSchema/productJoiSchema.js";
import _ from 'lodash';
import ForbiddenError from '../error/forbiddenError.js';

// Middleware pour vérifier l'accès à un produit
export const authorizeProductAccess = async (req, res, next) => {
  try {
    if (req.product.userId !== req.user.id) {
      throw new ForbiddenError('Access denied: You do not have permission to access this product');
    }
    res.data.product = req.product;
    next();
  } catch (error) {
    return next(error);
  }
};

export const setEntity = (req, res, next) => {
  req.entity = Product;
  next();
};

export const setCreateValidator = (req, res, next) => {
  req.schema = productSchema;
  next();
}

export const setUpdateValidator = (req, res, next) => {
  req.schema = updateProductSchema;
  next();
}