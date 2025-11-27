"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categoryController_1 = require("../controllers/categoryController");
const controllerWrapper_1 = require("../utils/controllerWrapper");
const authenticate_1 = __importDefault(require("../middlewares/authenticate"));
const categoryRouter = (0, express_1.Router)();
// Category CRUD
categoryRouter.get('/', (0, controllerWrapper_1.controllerWrapper)(categoryController_1.getAllCategories));
categoryRouter.post('/', authenticate_1.default, (0, controllerWrapper_1.controllerWrapper)(categoryController_1.createCategory));
categoryRouter.put('/:id', authenticate_1.default, (0, controllerWrapper_1.controllerWrapper)(categoryController_1.updateCategory));
categoryRouter.delete('/:id', authenticate_1.default, (0, controllerWrapper_1.controllerWrapper)(categoryController_1.deleteCategory));
// Category relations
categoryRouter.get('/:id/products', (0, controllerWrapper_1.controllerWrapper)(categoryController_1.getProductsByCategory));
exports.default = categoryRouter;
