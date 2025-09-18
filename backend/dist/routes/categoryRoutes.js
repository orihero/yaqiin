"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Category_1 = __importDefault(require("../models/Category"));
const Product_1 = __importDefault(require("../models/Product"));
const queryHelper_1 = require("../utils/queryHelper");
const router = (0, express_1.Router)();
// List all categories with pagination, filtering, and search
router.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { filter, page, limit, skip } = (0, queryHelper_1.parseQuery)(req, ['name.uz', 'name.ru', 'description.uz', 'description.ru']);
        const [categories, total] = yield Promise.all([
            Category_1.default.find(filter).skip(skip).limit(limit),
            Category_1.default.countDocuments(filter)
        ]);
        res.json({
            success: true,
            data: categories,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    }
    catch (err) {
        next(err);
    }
}));
router.get('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const category = yield Category_1.default.findById(req.params.id);
        if (!category)
            return next({ status: 404, message: 'Category not found' });
        res.json({ success: true, data: category });
    }
    catch (err) {
        next(err);
    }
}));
router.post('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const category = new Category_1.default(req.body);
        yield category.save();
        res.status(201).json({ success: true, data: category, message: 'Category created' });
    }
    catch (err) {
        next({ status: 400, message: 'Failed to create category', details: err });
    }
}));
router.put('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const category = yield Category_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!category)
            return next({ status: 404, message: 'Category not found' });
        res.json({ success: true, data: category, message: 'Category updated' });
    }
    catch (err) {
        next({ status: 400, message: 'Failed to update category', details: err });
    }
}));
// Bulk delete categories
router.delete('/bulk', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { categoryIds } = req.body;
        if (!categoryIds || !Array.isArray(categoryIds) || categoryIds.length === 0) {
            return next({ status: 400, message: 'Category IDs array is required' });
        }
        const result = yield Category_1.default.deleteMany({ _id: { $in: categoryIds } });
        res.json({
            success: true,
            data: { deletedCount: result.deletedCount },
            message: `Successfully deleted ${result.deletedCount} categories`
        });
    }
    catch (err) {
        next({ status: 400, message: 'Failed to delete categories', details: err });
    }
}));
router.delete('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const category = yield Category_1.default.findByIdAndDelete(req.params.id);
        if (!category)
            return next({ status: 404, message: 'Category not found' });
        res.json({ success: true, data: null, message: 'Category deleted' });
    }
    catch (err) {
        next(err);
    }
}));
// Get product counts for all categories
router.get('/product-counts', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productCounts = yield Product_1.default.aggregate([
            {
                $match: {
                    categoryId: { $exists: true, $ne: null }
                }
            },
            {
                $group: {
                    _id: '$categoryId',
                    count: { $sum: 1 }
                }
            }
        ]);
        const countsMap = {};
        productCounts.forEach(item => {
            if (item._id) {
                countsMap[item._id.toString()] = item.count;
            }
        });
        res.json({
            success: true,
            data: countsMap
        });
    }
    catch (err) {
        next(err);
    }
}));
// Seed categories endpoint
router.post('/seed', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const excelImportService = yield Promise.resolve().then(() => __importStar(require('../services/excelImportService')));
        const result = yield excelImportService.default.createComprehensiveCategories();
        res.json({
            success: result.success,
            data: {
                totalCategories: result.totalCategories,
                mainCategories: result.mainCategories
            },
            message: result.message
        });
    }
    catch (err) {
        next({ status: 500, message: 'Failed to seed categories', details: err });
    }
}));
exports.default = router;
