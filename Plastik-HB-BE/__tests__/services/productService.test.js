"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const productService_1 = require("../../services/productService");
const Product_1 = require("../../models/Product");
const Category_1 = require("../../models/Category");
const Asset_1 = require("../../models/Asset");
const categoryService_1 = require("../../services/categoryService");
const fileManager_1 = require("../../utils/fileManager");
const sequelize_1 = require("sequelize");
// Mock dependencies
jest.mock('../../models/Product');
jest.mock('../../models/Category');
jest.mock('../../models/Asset');
jest.mock('../../services/categoryService');
jest.mock('../../utils/fileManager');
const mockedProduct = Product_1.Product;
const mockedCategory = Category_1.Category;
const mockedAsset = Asset_1.Asset;
const mockedCategoryService = categoryService_1.CategoryService;
const mockedFileManager = fileManager_1.FileManager;
// Mock sequelize transaction
const mockTransaction = {
    commit: jest.fn(),
    rollback: jest.fn()
};
describe('ProductService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        Product_1.Product.sequelize = {
            transaction: jest.fn().mockResolvedValue(mockTransaction),
            fn: jest.fn(),
            col: jest.fn()
        };
    });
    describe('getAllProducts', () => {
        it('should return all products with associations', async () => {
            const mockProducts = [
                { id: '1', name: 'Product 1', assets: [], category: { id: '1', category: 'Electronics' } },
                { id: '2', name: 'Product 2', assets: [], category: { id: '2', category: 'Clothing' } }
            ];
            mockedProduct.findAll.mockResolvedValue(mockProducts);
            const result = await productService_1.ProductService.getAllProducts();
            expect(mockedProduct.findAll).toHaveBeenCalledWith({
                include: [
                    {
                        model: Asset_1.Asset,
                        as: 'assets',
                        order: [['order', 'ASC']]
                    },
                    { model: Category_1.Category, as: 'category' }
                ]
            });
            expect(result).toEqual(mockProducts);
        });
    });
    describe('getFeaturedProducts', () => {
        it('should return featured active products', async () => {
            const mockProducts = [
                { id: '1', name: 'Featured Product', featured: true, status: 'active' }
            ];
            mockedProduct.findAll.mockResolvedValue(mockProducts);
            const result = await productService_1.ProductService.getFeaturedProducts();
            expect(mockedProduct.findAll).toHaveBeenCalledWith({
                where: { featured: true, status: 'active' },
                include: [
                    {
                        model: Asset_1.Asset,
                        as: 'assets',
                        order: [['order', 'ASC']]
                    },
                    { model: Category_1.Category, as: 'category' }
                ]
            });
            expect(result).toEqual(mockProducts);
        });
    });
    describe('getProductById', () => {
        it('should return product by ID with associations', async () => {
            const mockProduct = {
                id: '1',
                name: 'Test Product',
                assets: [],
                category: { id: '1', category: 'Electronics' }
            };
            mockedProduct.findByPk.mockResolvedValue(mockProduct);
            const result = await productService_1.ProductService.getProductById('1');
            expect(mockedProduct.findByPk).toHaveBeenCalledWith('1', {
                include: [
                    {
                        model: Asset_1.Asset,
                        as: 'assets',
                        order: [['order', 'ASC']]
                    },
                    {
                        model: Category_1.Category,
                        as: 'category',
                        required: false
                    }
                ]
            });
            expect(result).toEqual(mockProduct);
        });
        it('should return null when product not found', async () => {
            mockedProduct.findByPk.mockResolvedValue(null);
            const result = await productService_1.ProductService.getProductById('999');
            expect(result).toBeNull();
        });
    });
    describe('getActiveProducts', () => {
        it('should return active products without filters', async () => {
            const mockProducts = [
                { id: '1', name: 'Active Product', status: 'active' }
            ];
            mockedProduct.findAll.mockResolvedValue(mockProducts);
            const result = await productService_1.ProductService.getActiveProducts();
            expect(mockedProduct.findAll).toHaveBeenCalledWith({
                where: { status: 'active' },
                include: [
                    {
                        model: Asset_1.Asset,
                        as: 'assets',
                        order: [['order', 'ASC']]
                    },
                    { model: Category_1.Category, as: 'category' }
                ],
                order: [['created_at', 'DESC']]
            });
            expect(result).toEqual(mockProducts);
        });
        it('should return active products with filters', async () => {
            const mockProducts = [
                { id: '1', name: 'Filtered Product', status: 'active' }
            ];
            mockedProduct.findAll.mockResolvedValue(mockProducts);
            const filters = {
                categoryId: '1',
                priceMin: 100,
                priceMax: 500,
                featured: true
            };
            const result = await productService_1.ProductService.getActiveProducts(filters);
            expect(mockedProduct.findAll).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    status: 'active',
                    category_id: '1',
                    featured: true,
                    price: expect.objectContaining({
                        [sequelize_1.Op.gte]: 100,
                        [sequelize_1.Op.lte]: 500
                    })
                })
            }));
            expect(result).toEqual(mockProducts);
        });
    });
    describe('createCompleteProduct', () => {
        it('should create product successfully with category_id', async () => {
            const productData = {
                name: 'New Product',
                price: 100,
                description: 'Test description',
                category_id: '1'
            };
            const mockCategory = { id: '1', category: 'Electronics' };
            const mockProduct = { id: '1', ...productData };
            const mockCompleteProduct = { ...mockProduct, assets: [], category: mockCategory };
            mockedCategoryService.getCategoryById.mockResolvedValue(mockCategory);
            mockedProduct.create.mockResolvedValue(mockProduct);
            mockedAsset.bulkCreate.mockResolvedValue([]);
            mockedProduct.findByPk.mockResolvedValue(mockCompleteProduct);
            const result = await productService_1.ProductService.createCompleteProduct(productData);
            expect(mockedCategoryService.getCategoryById).toHaveBeenCalledWith('1');
            expect(mockedProduct.create).toHaveBeenCalledWith({
                name: 'New Product',
                price: 100,
                description: 'Test description',
                specification: undefined,
                category_id: '1',
                discount: 0,
                featured: false,
                status: 'Draft'
            });
            expect(mockTransaction.commit).toHaveBeenCalled();
            expect(result).toEqual(mockCompleteProduct);
        });
        it('should create product with new category name', async () => {
            const productData = {
                name: 'New Product',
                price: 100,
                category_name: 'New Category'
            };
            const mockNewCategory = { id: '2', category: 'New Category' };
            const mockProduct = { id: '1', ...productData, category_id: '2' };
            mockedCategoryService.getAllCategories.mockResolvedValue([]);
            mockedCategoryService.createCategory.mockResolvedValue(mockNewCategory);
            mockedProduct.create.mockResolvedValue(mockProduct);
            mockedAsset.bulkCreate.mockResolvedValue([]);
            mockedProduct.findByPk.mockResolvedValue(mockProduct);
            const result = await productService_1.ProductService.createCompleteProduct(productData);
            expect(mockedCategoryService.createCategory).toHaveBeenCalledWith('New Category');
            expect(mockTransaction.commit).toHaveBeenCalled();
        });
        it('should rollback transaction on error', async () => {
            const productData = {
                name: 'New Product',
                price: 100,
                category_id: '999'
            };
            mockedCategoryService.getCategoryById.mockResolvedValue(null);
            await expect(productService_1.ProductService.createCompleteProduct(productData))
                .rejects.toThrow('Category with provided ID not found');
            expect(mockTransaction.rollback).toHaveBeenCalled();
        });
        it('should handle uploaded files', async () => {
            const productData = {
                name: 'New Product',
                price: 100,
                category_id: '1'
            };
            const uploadedFiles = [
                { filename: 'image1.jpg' },
                { filename: 'image2.jpg' }
            ];
            const mockCategory = { id: '1', category: 'Electronics' };
            const mockProduct = { id: '1', ...productData };
            mockedCategoryService.getCategoryById.mockResolvedValue(mockCategory);
            mockedProduct.create.mockResolvedValue(mockProduct);
            mockedAsset.bulkCreate.mockResolvedValue([]);
            mockedProduct.findByPk.mockResolvedValue(mockProduct);
            await productService_1.ProductService.createCompleteProduct(productData, uploadedFiles);
            expect(mockedAsset.bulkCreate).toHaveBeenCalledWith([
                {
                    product_id: '1',
                    url: 'image1.jpg',
                    alt: 'Alt-Image-Produk.png',
                    type: 'IMAGE',
                    order: 1
                },
                {
                    product_id: '1',
                    url: 'image2.jpg',
                    alt: 'Alt-Image-Produk.png',
                    type: 'IMAGE',
                    order: 2
                }
            ]);
        });
    });
    describe('deleteProduct', () => {
        it('should delete product successfully', async () => {
            const mockProduct = {
                id: '1',
                name: 'Product to delete',
                assets: [{ url: 'image1.jpg' }, { url: 'image2.jpg' }],
                destroy: jest.fn().mockResolvedValue(undefined)
            };
            mockedProduct.findByPk.mockResolvedValue(mockProduct);
            mockedAsset.destroy.mockResolvedValue(2);
            const result = await productService_1.ProductService.deleteProduct('1');
            expect(mockedFileManager.deleteFiles).toHaveBeenCalledWith(['image1.jpg', 'image2.jpg']);
            expect(mockedAsset.destroy).toHaveBeenCalledWith({ where: { product_id: '1' } });
            expect(mockProduct.destroy).toHaveBeenCalled();
            expect(result.id).toBe('1');
        });
        it('should throw error when product not found', async () => {
            mockedProduct.findByPk.mockResolvedValue(null);
            await expect(productService_1.ProductService.deleteProduct('999'))
                .rejects.toThrow("Product with ID '999' not found");
        });
    });
});
