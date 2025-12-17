"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("./product.controller");
const router = (0, express_1.Router)({ mergeParams: true });
router.post('/:sellerId', product_controller_1.createProduct);
router.get('/:sellerId', product_controller_1.listProducts);
router.put('/:productId', product_controller_1.updateProduct);
router.post('/:sellerId/extra', product_controller_1.addExtraProduct);
router.get('/:sellerId/extra', product_controller_1.listExtraProducts);
exports.default = router;
//# sourceMappingURL=product.routes.js.map