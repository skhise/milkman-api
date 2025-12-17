import { Router } from 'express';
import { createProduct, listProducts, updateProduct, addExtraProduct, listExtraProducts } from './product.controller';

const router = Router({ mergeParams: true });

router.post('/:sellerId', createProduct);
router.get('/:sellerId', listProducts);
router.put('/:productId', updateProduct);
router.post('/:sellerId/extra', addExtraProduct);
router.get('/:sellerId/extra', listExtraProducts);

export default router;
