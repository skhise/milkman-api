import { productService } from './product.service.js';

export const createProduct = async (req, res, next) => {
  try {
    const product = await productService.create(req.params.sellerId, req.body);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

export const listProducts = async (req, res, next) => {
  try {
    const products = await productService.list(req.params.sellerId);
    res.json(products);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.update(req.params.productId, req.body);
    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const addExtraProduct = async (req, res, next) => {
  try {
    const extraProduct = await productService.addExtraProduct(req.params.sellerId, req.body);
    res.status(201).json(extraProduct);
  } catch (error) {
    next(error);
  }
};

export const listExtraProducts = async (req, res, next) => {
  try {
    const extraProducts = await productService.listExtraProducts(
      req.params.sellerId,
      req.query.customerId,
      req.query.dateFrom,
      req.query.dateTo,
    );
    res.json(extraProducts);
  } catch (error) {
    next(error);
  }
};
