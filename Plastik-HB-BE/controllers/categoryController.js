"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductsByCategory = exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getAllCategories = void 0;
const categoryService_1 = require("../services/categoryService");
/**
 * @desc Get all categories
 * @route GET /categories
 */
const getAllCategories = async (req, res) => {
    const categories = await categoryService_1.CategoryService.getAllCategories();
    const categoriesWithCount = await Promise.all(categories.map(async (cat) => {
        const base = cat.dataValues ? cat.dataValues : cat;
        const products = await categoryService_1.CategoryService.getProductsByCategory(base.id);
        return {
            id: base.id,
            category: base.category,
            created_at: base.created_at,
            updated_at: base.updated_at,
            productCount: Array.isArray(products) ? products.length : 0
        };
    }));
    return { data: categoriesWithCount, status: 200 };
};
exports.getAllCategories = getAllCategories;
/**
 * @desc Create new category
 * @route POST /categories
 */
const createCategory = async (req, res) => {
    const category = req.body.name;
    if (!category || typeof category !== 'string') {
        throw { message: 'Category name is required and must be a string', status: 400 };
    }
    const categoryName = category.trim();
    if (categoryName.length < 2) {
        throw { message: 'Category name must be at least 2 characters long', status: 400 };
    }
    if (categoryName.length > 50) {
        throw { message: 'Category name must not exceed 50 characters', status: 400 };
    }
    const newCategory = await categoryService_1.CategoryService.createCategory(categoryName);
    return {
        data: newCategory,
        status: 201,
        message: 'Category created successfully'
    };
};
exports.createCategory = createCategory;
/**
 * @desc Update category
 * @route PUT /categories/:id
 */
const updateCategory = async (req, res) => {
    const { id } = req.params;
    const category = req.body.name;
    console.log('Updating category:', id, category);
    if (!category) {
        throw { message: 'Category name is required', status: 400 };
    }
    if (!(await (0, categoryService_1.isCategoryExist)(id))) {
        throw { message: 'Category not found', status: 404 };
    }
    const updatedCategory = await categoryService_1.CategoryService.updateCategory(id, category);
    return {
        data: updatedCategory,
        status: 200,
        message: 'Category updated successfully'
    };
};
exports.updateCategory = updateCategory;
/**
 * @desc Delete category
 * @route DELETE /categories/:id
 */
const deleteCategory = async (req, res) => {
    const { id } = req.params;
    if (!(await (0, categoryService_1.isCategoryExist)(id))) {
        throw { message: 'Category not found', status: 404 };
    }
    await categoryService_1.CategoryService.deleteCategory(id);
    return {
        data: null,
        status: 200,
        message: 'Category deleted successfully'
    };
};
exports.deleteCategory = deleteCategory;
/**
 * @desc Get products by category
 * @route GET /categories/:id/products
 */
const getProductsByCategory = async (req, res) => {
    const { id } = req.params;
    if (!(await (0, categoryService_1.isCategoryExist)(id))) {
        throw { message: 'Category not found', status: 404 };
    }
    const products = await categoryService_1.CategoryService.getProductsByCategory(id);
    return {
        data: products,
        status: 200
    };
};
exports.getProductsByCategory = getProductsByCategory;
