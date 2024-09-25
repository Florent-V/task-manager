import Product from '../models/productModel.js';
import NotFoundError from '../error/notFoundError.js';

// Création d'un Product
export const createProduct = async (req, res, next) => {
  try {
    const userId = req.user.id; //
    req.body.image = req.file ? req.file.filename : 'default-product-image.webp';
    req.body.userId = userId;

    res.statusCode = 201;
    res.data.product = await Product.create(req.body);
    next();
  } catch (error) {
    return next(error);
  }
};

// Récupération de tous les Products
export const getAllProducts = async (req, res, next) => {
  try {
    res.data.products = await Product.findAll();
  } catch (error) {
    return next(error);
  }
};

// Récupération d'un Product par ID
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) throw new NotFoundError('Product Not Found');

    req.data = product;
    next();
  } catch (error) {
    return next(error);
  }
};

// Mise à jour d'un Product
export const updateProduct = async (req, res, next) => {
  try {
    if (req.file) req.body.image = req.file.filename;
    const [updated] = await Product.update(req.body, {
      where: { id: req.params.id }
    });

    if (!updated) throw new NotFoundError('Product Not Found');

    res.data.product = await Product.findByPk(req.params.id);
    next();
  } catch (error) {
    return next(error);
  }
};

// Suppression d'un Product
export const deleteProduct = async (req, res, next) => {
  try {
    const deleted = await Product.destroy({
      where: { id: req.params.id }
    });

    if (!deleted) throw new NotFoundError('Product Not Found');

    res.status(204).json();
  } catch (error) {
    return next(error);
  }
};
