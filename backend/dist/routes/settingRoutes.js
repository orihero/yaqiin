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
const Setting_1 = __importDefault(require("../models/Setting"));
const queryHelper_1 = require("../utils/queryHelper");
const router = (0, express_1.Router)();
// List all settings with pagination, filtering, and search
router.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { filter, page, limit, skip } = (0, queryHelper_1.parseQuery)(req);
        const [settings, total] = yield Promise.all([
            Setting_1.default.find(filter).skip(skip).limit(limit),
            Setting_1.default.countDocuments(filter)
        ]);
        res.json({
            success: true,
            data: settings,
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
// Get setting by ID
router.get('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const setting = yield Setting_1.default.findById(req.params.id);
        if (!setting)
            return next({ status: 404, message: 'Setting not found' });
        res.json({ success: true, data: setting });
    }
    catch (err) {
        next(err);
    }
}));
// Create setting
router.post('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const setting = new Setting_1.default(req.body);
        yield setting.save();
        res.status(201).json({ success: true, data: setting, message: 'Setting created' });
    }
    catch (err) {
        next({ status: 400, message: 'Failed to create setting', details: err });
    }
}));
// Update setting
router.put('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const setting = yield Setting_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!setting)
            return next({ status: 404, message: 'Setting not found' });
        res.json({ success: true, data: setting, message: 'Setting updated' });
    }
    catch (err) {
        next({ status: 400, message: 'Failed to update setting', details: err });
    }
}));
// Delete setting
router.delete('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const setting = yield Setting_1.default.findByIdAndDelete(req.params.id);
        if (!setting)
            return next({ status: 404, message: 'Setting not found' });
        res.json({ success: true, data: null, message: 'Setting deleted' });
    }
    catch (err) {
        next(err);
    }
}));
exports.default = router;
