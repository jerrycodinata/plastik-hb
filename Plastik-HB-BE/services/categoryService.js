"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCategoryExist = exports.CategoryService = void 0;
const Category_1 = require("../models/Category");
const Product_1 = require("../models/Product");
const Asset_1 = require("../models/Asset");
class CategoryService {
    /**
     * Get all categories with optional product count
     */
    static async getAllCategories(includeProductCount = false) {
        if (includeProductCount) {
            return await Category_1.Category.findAll({
                attributes: {
                    include: [
                        [
                            Product_1.Product.sequelize.fn('COUNT', Product_1.Product.sequelize.col('products.id')),
                            'productCount'
                        ]
                    ]
                },
                include: [
                    {
                        model: Product_1.Product,
                        as: 'products',
                        attributes: [],
                        required: false
                    }
                ],
                group: ['Category.id'],
                order: [['category', 'ASC']]
            });
        }
        return await Category_1.Category.findAll({
            order: [['category', 'ASC']]
        });
    }
    /**
     * Get category by ID with optional relations
     */
    static async getCategoryById(id, includeProducts = false) {
        const include = includeProducts ? [
            {
                model: Product_1.Product,
                as: 'products',
                include: [{ model: Asset_1.Asset, as: 'assets' }]
            }
        ] : [];
        return await Category_1.Category.findByPk(id, { include });
    }
    /**
     * Create new category
     */
    static async createCategory(categoryName) {
        const existingCategory = await Category_1.Category.findOne({
            where: { category: categoryName }
        });
        if (existingCategory) {
            throw new Error(`Category '${categoryName}' already exists`);
        }
        return await Category_1.Category.create({ category: categoryName });
    }
    /**
     * Update category by ID
     */
    static async updateCategory(id, categoryName) {
        const existingCategory = await Category_1.Category.findByPk(id);
        if (!existingCategory) {
            throw new Error(`Category with ID '${id}' not found`);
        }
        const duplicateCategory = await Category_1.Category.findOne({
            where: {
                category: categoryName.trim(),
                id: { [require('sequelize').Op.ne]: id }
            }
        });
        if (duplicateCategory) {
            throw new Error(`Category '${categoryName}' already exists`);
        }
        await existingCategory.update({ category: categoryName.trim() });
        return existingCategory;
    }
    /**
     * Delete category by ID
     */
    static async deleteCategory(id) {
        const existingCategory = await Category_1.Category.findByPk(id);
        if (!existingCategory) {
            throw new Error(`Category with ID '${id}' not found`);
        }
        const productsUsingCategory = await Product_1.Product.count({
            where: { category_id: id }
        });
        if (productsUsingCategory > 0) {
            throw new Error(`Cannot delete category. ${productsUsingCategory} product(s) are using this category`);
        }
        await existingCategory.destroy();
    }
    /**
     * Get all products in a specific category
     */
    static async getProductsByCategory(categoryId) {
        const category = await Category_1.Category.findByPk(categoryId);
        if (!category) {
            throw new Error(`Category with ID '${categoryId}' not found`);
        }
        return await Product_1.Product.findAll({
            where: { category_id: categoryId },
            include: [
                { model: Asset_1.Asset, as: 'assets' },
                { model: Category_1.Category, as: 'category' }
            ],
            order: [['created_at', 'DESC']]
        });
    }
    /**
     * Search categories by name
     */
    static async searchCategories(searchTerm) {
        return await Category_1.Category.findAll({
            where: {
                category: {
                    [require('sequelize').Op.iLike]: `%${searchTerm}%`
                }
            },
            order: [['category', 'ASC']]
        });
    }
    /**
     * Get category statistics
     */
    static async getCategoryStats(id) {
        const category = await Category_1.Category.findByPk(id);
        if (!category) {
            throw new Error(`Category with ID '${id}' not found`);
        }
        const productCount = await Product_1.Product.count({
            where: { category_id: id }
        });
        const featuredProductCount = await Product_1.Product.count({
            where: {
                category_id: id,
                featured: true
            }
        });
        const activeProductCount = await Product_1.Product.count({
            where: {
                category_id: id,
                status: 'Aktif'
            }
        });
        return {
            category,
            productCount,
            featuredProductCount,
            activeProductCount
        };
    }
}
exports.CategoryService = CategoryService;
/**
* Check category existence
*/
const isCategoryExist = async (id) => {
    let category;
    try {
        category = await Category_1.Category.findByPk(id);
    }
    catch (error) {
        return false;
    }
    return !!category;
};
exports.isCategoryExist = isCategoryExist;
