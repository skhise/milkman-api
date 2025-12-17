"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listExtraProducts = exports.addExtraProduct = exports.updateProduct = exports.listProducts = exports.createProduct = void 0;
const product_service_1 = require("./product.service");
const createProduct = async (req, res, next) => {
    try {
        const product = await product_service_1.productService.create(req.params.sellerId, req.body);
        res.status(201).json(product);
    }
    catch (error) {
        next(error);
    }
};
exports.createProduct = createProduct;
const listProducts = async (req, res, next) => {
    try {
        const products = await product_service_1.productService.list(req.params.sellerId);
        res.json(products);
    }
    catch (error) {
        next(error);
    }
};
exports.listProducts = listProducts;
const updateProduct = async (req, res, next) => {
    try {
        const product = await product_service_1.productService.update(req.params.productId, req.body);
        res.json(product);
    }
    catch (error) {
        next(error);
    }
};
exports.updateProduct = updateProduct;
const addExtraProduct = async (req, res, next) => {
    try {
        const extraProduct = await product_service_1.productService.addExtraProduct(req.params.sellerId, req.body);
        res.status(201).json(extraProduct);
    }
    catch (error) {
        next(error);
    }
};
exports.addExtraProduct = addExtraProduct;
const listExtraProducts = async (req, res, next) => {
    try {
        const extraProducts = await product_service_1.productService.listExtraProducts(req.params.sellerId, req.query.customerId, req.query.dateFrom, req.query.dateTo);
        res.json(extraProducts);
    }
    catch (error) {
        next(error);
    }
};
exports.listExtraProducts = listExtraProducts;
//# sourceMappingURL=product.controller.js.map