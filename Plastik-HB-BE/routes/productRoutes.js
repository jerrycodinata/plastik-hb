"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const controllerWrapper_1 = require("../utils/controllerWrapper");
const uploadImageMiddleware_1 = require("../utils/uploadImageMiddleware");
const authenticate_1 = __importDefault(require("../middlewares/authenticate"));
const productRouter = (0, express_1.Router)();
// Public catalog routes (no auth required)
productRouter.get('/catalog', (0, controllerWrapper_1.controllerWrapper)(productController_1.getCatalogProducts));
productRouter.get('/categories', (0, controllerWrapper_1.controllerWrapper)(productController_1.getActiveCategories));
productRouter.get('/all-categories', (0, controllerWrapper_1.controllerWrapper)(productController_1.getAllCategoriesForCatalog));
productRouter.get('/featured', (0, controllerWrapper_1.controllerWrapper)(productController_1.getFeaturedProducts));
productRouter.post('/', authenticate_1.default, uploadImageMiddleware_1.uploadProductImages, (0, controllerWrapper_1.controllerWrapper)(productController_1.createProduct));
// Admin routes
productRouter.get('/', (0, controllerWrapper_1.controllerWrapper)(productController_1.getAllProducts));
productRouter.put('/featured', authenticate_1.default, (0, controllerWrapper_1.controllerWrapper)(productController_1.updateFeaturedProducts));
// Public product detail route (no auth required) - Must be AFTER specific routes
productRouter.get('/:id', (0, controllerWrapper_1.controllerWrapper)(productController_1.getProductById));
productRouter.post('/', authenticate_1.default, uploadImageMiddleware_1.uploadProductImages, (0, controllerWrapper_1.controllerWrapper)(productController_1.createProduct));
productRouter.put('/:id', authenticate_1.default, uploadImageMiddleware_1.uploadProductImages, (0, controllerWrapper_1.controllerWrapper)(productController_1.updateProduct));
productRouter.delete('/:id', authenticate_1.default, (0, controllerWrapper_1.controllerWrapper)(productController_1.deleteProduct));
// Asset management routes
productRouter.delete('/:id/assets/:assetId', authenticate_1.default, (0, controllerWrapper_1.controllerWrapper)(productController_1.deleteProductAsset));
productRouter.put('/:id/assets/:assetId', authenticate_1.default, uploadImageMiddleware_1.uploadProductImages, (0, controllerWrapper_1.controllerWrapper)(productController_1.replaceAsset));
productRouter.patch('/:id/assets/reorder', authenticate_1.default, (0, controllerWrapper_1.controllerWrapper)(productController_1.reorderAssets));
productRouter.put('/:id/main-image', authenticate_1.default, uploadImageMiddleware_1.uploadProductImages, (0, controllerWrapper_1.controllerWrapper)(productController_1.replaceMainImage));
exports.default = productRouter;
