"use strict";
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
const Delivery_1 = __importDefault(require("../models/Delivery"));
const queryHelper_1 = require("../utils/queryHelper");
const router = (0, express_1.Router)();
// List all deliveries with pagination, filtering, and search
router.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { filter, page, limit, skip } = (0, queryHelper_1.parseQuery)(req);
        const [deliveries, total] = yield Promise.all([
            Delivery_1.default.find(filter).skip(skip).limit(limit),
            Delivery_1.default.countDocuments(filter)
        ]);
        res.json({
            success: true,
            data: deliveries,
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
// Get delivery by ID
router.get('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const delivery = yield Delivery_1.default.findById(req.params.id);
        if (!delivery)
            return next({ status: 404, message: 'Delivery not found' });
        res.json({ success: true, data: delivery });
    }
    catch (err) {
        next(err);
    }
}));
// Create delivery
router.post('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const delivery = new Delivery_1.default(req.body);
        yield delivery.save();
        res.status(201).json({ success: true, data: delivery, message: 'Delivery created' });
    }
    catch (err) {
        next({ status: 400, message: 'Failed to create delivery', details: err });
    }
}));
// Update delivery
router.put('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const delivery = yield Delivery_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!delivery)
            return next({ status: 404, message: 'Delivery not found' });
        res.json({ success: true, data: delivery, message: 'Delivery updated' });
    }
    catch (err) {
        next({ status: 400, message: 'Failed to update delivery', details: err });
    }
}));
// Delete delivery
router.delete('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const delivery = yield Delivery_1.default.findByIdAndDelete(req.params.id);
        if (!delivery)
            return next({ status: 404, message: 'Delivery not found' });
        res.json({ success: true, data: null, message: 'Delivery deleted' });
    }
    catch (err) {
        next(err);
    }
}));
exports.default = router;
