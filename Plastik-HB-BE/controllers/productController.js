"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCategoriesForCatalog = exports.getActiveCategories = exports.getCatalogProducts = exports.updateFeaturedProducts = exports.reorderAssets = exports.replaceAsset = exports.replaceMainImage = exports.deleteProductAsset = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getFeaturedProducts = exports.getAllProducts = void 0;
const productService_1 = require("../services/productService");
const Product_1 = require("../models/Product");
const Asset_1 = require("../models/Asset");
const Category_1 = require("../models/Category");
/**
 * @desc Fetch all products with assets and category
 * @route GET /products
 */
const getAllProducts = async (req, res) => {
    const products = await productService_1.ProductService.getAllProducts();
    return { data: products, status: 200 };
};
exports.getAllProducts = getAllProducts;
/**
 * @desc Fetch all featured products with assets and category
 * @route GET /products/featured
 */
const getFeaturedProducts = async (req, res) => {
    const products = await productService_1.ProductService.getFeaturedProducts();
    return { data: products, status: 200 };
};
exports.getFeaturedProducts = getFeaturedProducts;
/**
 * @desc Fetch single product by ID with assets and category
 * @route GET /products/:id
 */
const getProductById = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        throw { message: 'Product ID is required.', status: 400 };
    }
    const product = await productService_1.ProductService.getProductById(id);
    if (!product) {
        throw { message: 'Product not found.', status: 404 };
    }
    return { data: product, status: 200 };
};
exports.getProductById = getProductById;
/**
 * @desc Create new product with file upload
 * @route POST /products
 */
const createProduct = async (req, res) => {
    const { name, price, description, specification, category_name, category_id, discount, featured, status } = req.body;
    const uploadedFiles = req.files;
    if (!name || !price) {
        throw { message: 'Name and price are required.', status: 400 };
    }
    if (!category_name && !category_id) {
        throw { message: 'Either category_name or category_id is required.', status: 400 };
    }
    const productData = {
        name,
        price,
        description,
        specification,
        category_name,
        category_id,
        discount,
        featured,
        status
    };
    const product = await productService_1.ProductService.createCompleteProduct(productData, uploadedFiles);
    return {
        data: product,
        status: 201,
        message: 'Product created successfully'
    };
};
exports.createProduct = createProduct;
/**
 * @desc Update existing product
 * @route PUT /products/:id
 */
const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, price, description, specification, category_name, category_id, discount, featured, status } = req.body;
    if (!name || !price) {
        throw { message: 'Name and price are required.', status: 400 };
    }
    if (!category_name && !category_id) {
        throw { message: 'Either category_name or category_id is required.', status: 400 };
    }
    const productData = {
        name,
        price,
        description,
        specification,
        category_name,
        category_id,
        discount,
        featured,
        status
    };
    const uploadedFiles = req.files || [];
    const updatedProduct = await productService_1.ProductService.updateProduct(id, productData, uploadedFiles);
    return {
        data: updatedProduct,
        status: 200,
        message: 'Product updated successfully'
    };
};
exports.updateProduct = updateProduct;
/**
 * @desc Delete existing product
 * @route DELETE /products/:id
 */
const deleteProduct = async (req, res) => {
    const { id } = req.params;
    const deletedProduct = await productService_1.ProductService.deleteProduct(id);
    return {
        data: deletedProduct,
        status: 200,
        message: 'Product deleted successfully'
    };
};
exports.deleteProduct = deleteProduct;
/**
 * @desc Delete product asset
 * @route DELETE /products/:id/assets/:assetId
 */
const deleteProductAsset = async (req, res) => {
    const { id: productId, assetId } = req.params;
    const deletedAsset = await productService_1.ProductService.deleteProductAsset(productId, assetId);
    return {
        data: deletedAsset,
        status: 200,
        message: 'Asset deleted successfully'
    };
};
exports.deleteProductAsset = deleteProductAsset;
/**
 * @desc Replace main image of product
 * @route PUT /products/:id/main-image
 */
const replaceMainImage = async (req, res) => {
    const { id } = req.params;
    const uploadedFiles = req.files || [];
    if (uploadedFiles.length === 0) {
        throw { message: 'No image file provided', status: 400 };
    }
    const updatedProduct = await productService_1.ProductService.replaceMainImage(id, uploadedFiles[0]);
    return {
        data: updatedProduct,
        status: 200,
        message: 'Main image replaced successfully'
    };
};
exports.replaceMainImage = replaceMainImage;
/**
 * @desc Replace specific asset by asset ID
 * @route PUT /products/:id/assets/:assetId
 */
const replaceAsset = async (req, res) => {
    const { id: productId, assetId } = req.params;
    const uploadedFiles = req.files || [];
    if (uploadedFiles.length === 0) {
        throw { message: 'No image file provided', status: 400 };
    }
    const updatedProduct = await productService_1.ProductService.replaceAssetById(productId, assetId, uploadedFiles[0]);
    return {
        data: updatedProduct,
        status: 200,
        message: 'Asset replaced successfully'
    };
};
exports.replaceAsset = replaceAsset;
/**
 * @desc Reorder assets of a product
 * @route PATCH /products/:id/assets/reorder
 */
const reorderAssets = async (req, res) => {
    const { id: productId } = req.params;
    const { assetOrderMap } = req.body;
    if (!assetOrderMap || !Array.isArray(assetOrderMap)) {
        throw { message: 'assetOrderMap is required and must be an array', status: 400 };
    }
    const updatedProduct = await productService_1.ProductService.reorderAssets(productId, assetOrderMap);
    return {
        data: updatedProduct,
        status: 200,
        message: 'Assets reordered successfully'
    };
};
exports.reorderAssets = reorderAssets;
/* @desc Update featured products
 * @route PUT /products/featured
 * @body { productIds: string[] }
 */
const updateFeaturedProducts = async (req, res) => {
    const { productIds } = req.body;
    if (!Array.isArray(productIds)) {
        return res.status(400).json({ message: 'productIds must be an array' });
    }
    // Set all products to not featured
    await Product_1.Product.update({ featured: false }, { where: {} });
    // Set selected products to featured
    await Product_1.Product.update({ featured: true }, { where: { id: productIds } });
    // Return updated featured products
    const featured = await Product_1.Product.findAll({
        where: { featured: true },
        include: [
            { model: Asset_1.Asset, as: 'assets' },
            { model: Category_1.Category, as: 'category' }
        ]
    });
    return res.status(200).json({ message: 'Featured products updated', data: featured });
};
exports.updateFeaturedProducts = updateFeaturedProducts;
/**
 * @desc Get active products for public catalog with filters
 * @route GET /products/catalog
 * @query ?categoryId=string&priceMin=number&priceMax=number&featured=boolean
 */
const getCatalogProducts = async (req, res) => {
    const { categoryId, priceMin, priceMax, featured } = req.query;
    const filters = {};
    if (categoryId)
        filters.categoryId = categoryId;
    if (priceMin)
        filters.priceMin = Number(priceMin);
    if (priceMax)
        filters.priceMax = Number(priceMax);
    if (featured !== undefined)
        filters.featured = featured === 'true';
    const products = await productService_1.ProductService.getActiveProducts(filters);
    return {
        data: products,
        status: 200,
        message: 'Catalog products retrieved successfully'
    };
};
exports.getCatalogProducts = getCatalogProducts;
/**
 * @desc Get categories with active products
 * @route GET /products/categories
 */
const getActiveCategories = async (req, res) => {
    try {
        console.log('🔍 Fetching categories with active products...');
        const categories = await productService_1.ProductService.getActiveCategories();
        console.log(`✅ Found ${categories.length} categories with active products`);
        return {
            data: categories,
            status: 200,
            message: 'Active categories retrieved successfully'
        };
    }
    catch (error) {
        console.error('❌ Error in getActiveCategories:', error);
        throw {
            message: 'Failed to fetch categories: ' + error.message,
            status: 500
        };
    }
};
exports.getActiveCategories = getActiveCategories;
/**
 * @desc Get all categories (fallback for public catalog)
 * @route GET /products/all-categories
 */
const getAllCategoriesForCatalog = async (req, res) => {
    try {
        console.log('🔍 Fetching all categories for catalog...');
        const categories = await Category_1.Category.findAll({
            order: [['category', 'ASC']]
        });
        console.log(`✅ Found ${categories.length} total categories`);
        return {
            data: categories,
            status: 200,
            message: 'All categories retrieved successfully'
        };
    }
    catch (error) {
        console.error('❌ Error in getAllCategoriesForCatalog:', error);
        throw {
            message: 'Failed to fetch all categories: ' + error.message,
            status: 500
        };
    }
};
exports.getAllCategoriesForCatalog = getAllCategoriesForCatalog;
exports.default = {
    getAllProducts: exports.getAllProducts,
    getFeaturedProducts: exports.getFeaturedProducts,
    createProduct: exports.createProduct,
    updateProduct: exports.updateProduct,
    deleteProduct: exports.deleteProduct,
    deleteProductAsset: exports.deleteProductAsset,
    replaceMainImage: exports.replaceMainImage,
    replaceAsset: exports.replaceAsset,
    reorderAssets: exports.reorderAssets,
    updateFeaturedProducts: exports.updateFeaturedProducts,
    getCatalogProducts: exports.getCatalogProducts,
    getActiveCategories: exports.getActiveCategories,
    getAllCategoriesForCatalog: exports.getAllCategoriesForCatalog
};
