import { Request, Response, NextFunction } from 'express';
import { productService } from './product.service';

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await productService.create(req.params.sellerId!, req.body);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

export const listProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await productService.list(req.params.sellerId!);
    res.json(products);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await productService.update(req.params.productId!, req.body);
    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const addExtraProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const extraProduct = await productService.addExtraProduct(req.params.sellerId!, req.body);
    res.status(201).json(extraProduct);
  } catch (error) {
    next(error);
  }
};

export const listExtraProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const extraProducts = await productService.listExtraProducts(
      req.params.sellerId!,
      req.query.customerId as string | undefined,
      req.query.dateFrom as string | undefined,
      req.query.dateTo as string | undefined,
    );
    res.json(extraProducts);
  } catch (error) {
    next(error);
  }
};
