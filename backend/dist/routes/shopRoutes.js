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
const Shop_1 = __importDefault(require("../models/Shop"));
const queryHelper_1 = require("../utils/queryHelper");
const mongoose_1 = __importDefault(require("mongoose"));
const Group_1 = __importDefault(require("../models/Group"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const router = (0, express_1.Router)();
// Multer setup for shop images
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path_1.default.join(__dirname, '../../uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, 'shop-' + uniqueSuffix + '-' + file.originalname);
    },
});
const upload = (0, multer_1.default)({ storage });
// List all shops with pagination, filtering, and search
router.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { filter, page, limit, skip } = (0, queryHelper_1.parseQuery)(req, ['name', 'description']);
        const [shops, total] = yield Promise.all([
            Shop_1.default.find(filter).skip(skip).limit(limit),
            Shop_1.default.countDocuments(filter)
        ]);
        res.json({
            success: true,
            data: shops,
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
        const shop = yield Shop_1.default.findById(req.params.id);
        if (!shop)
            return next({ status: 404, message: 'Shop not found' });
        res.json({ success: true, data: shop });
    }
    catch (err) {
        next(err);
    }
}));
router.post('/', upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'logo', maxCount: 1 }
]), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = req.body;
        const files = req.files;
        console.log('Shop create request body:', body);
        console.log('Shop create files:', files);
        // Parse JSON strings from FormData
        if (typeof body.contactInfo === 'string') {
            try {
                body.contactInfo = JSON.parse(body.contactInfo);
                console.log('Parsed contactInfo:', body.contactInfo);
            }
            catch (e) {
                console.log('Failed to parse contactInfo:', e);
                // If parsing fails, keep as is
            }
        }
        if (typeof body.address === 'string') {
            try {
                body.address = JSON.parse(body.address);
                console.log('Parsed address:', body.address);
            }
            catch (e) {
                console.log('Failed to parse address:', e);
                // If parsing fails, keep as is
            }
        }
        if (typeof body.operatingHours === 'string') {
            try {
                body.operatingHours = JSON.parse(body.operatingHours);
                console.log('Parsed operatingHours:', body.operatingHours);
            }
            catch (e) {
                console.log('Failed to parse operatingHours:', e);
                // If parsing fails, keep as is
            }
        }
        if (typeof body.deliveryZones === 'string') {
            try {
                body.deliveryZones = JSON.parse(body.deliveryZones);
                console.log('Parsed deliveryZones:', body.deliveryZones);
            }
            catch (e) {
                console.log('Failed to parse deliveryZones:', e);
                // If parsing fails, keep as is
            }
        }
        // Handle uploaded files
        const baseUrl = req.protocol + '://' + req.get('host');
        console.log('Base URL for file uploads (POST):', baseUrl);
        if (files && files.photo && files.photo.length > 0) {
            body.photo = baseUrl + '/uploads/' + files.photo[0].filename;
            console.log('Photo file uploaded (POST):', files.photo[0].filename);
            console.log('Photo URL set to (POST):', body.photo);
        }
        if (files && files.logo && files.logo.length > 0) {
            body.logo = baseUrl + '/uploads/' + files.logo[0].filename;
            console.log('Logo file uploaded (POST):', files.logo[0].filename);
            console.log('Logo URL set to (POST):', body.logo);
        }
        // Handle external URLs if provided
        if (body.photoUrl && !body.photo) {
            body.photo = body.photoUrl;
        }
        if (body.logoUrl && !body.logo) {
            body.logo = body.logoUrl;
        }
        const shop = new Shop_1.default(body);
        yield shop.save();
        res.status(201).json({ success: true, data: shop, message: 'Shop created' });
    }
    catch (err) {
        next({ status: 400, message: 'Failed to create shop', details: err });
    }
}));
router.put('/:id', upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'logo', maxCount: 1 }
]), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = req.body;
        const files = req.files;
        console.log('Shop update request body:', body);
        console.log('Shop update files:', files);
        console.log('Fields being updated:', Object.keys(body));
        console.log('Request headers:', req.headers);
        console.log('Content-Type:', req.get('Content-Type'));
        // Parse JSON strings from FormData
        if (typeof body.contactInfo === 'string') {
            try {
                body.contactInfo = JSON.parse(body.contactInfo);
                console.log('Parsed contactInfo:', body.contactInfo);
            }
            catch (e) {
                console.log('Failed to parse contactInfo:', e);
                // If parsing fails, keep as is
            }
        }
        if (typeof body.address === 'string') {
            try {
                body.address = JSON.parse(body.address);
                console.log('Parsed address:', body.address);
            }
            catch (e) {
                console.log('Failed to parse address:', e);
                // If parsing fails, keep as is
            }
        }
        if (typeof body.operatingHours === 'string') {
            try {
                body.operatingHours = JSON.parse(body.operatingHours);
                console.log('Parsed operatingHours:', body.operatingHours);
            }
            catch (e) {
                console.log('Failed to parse operatingHours:', e);
                // If parsing fails, keep as is
            }
        }
        if (typeof body.deliveryZones === 'string') {
            try {
                body.deliveryZones = JSON.parse(body.deliveryZones);
                console.log('Parsed deliveryZones:', body.deliveryZones);
            }
            catch (e) {
                console.log('Failed to parse deliveryZones:', e);
                // If parsing fails, keep as is
            }
        }
        // Handle uploaded files
        const baseUrl = req.protocol + '://' + req.get('host');
        console.log('Base URL for file uploads (PUT):', baseUrl);
        if (files && files.photo && files.photo.length > 0) {
            body.photo = baseUrl + '/uploads/' + files.photo[0].filename;
            console.log('Photo file uploaded (PUT):', files.photo[0].filename);
            console.log('Photo URL set to (PUT):', body.photo);
        }
        if (files && files.logo && files.logo.length > 0) {
            body.logo = baseUrl + '/uploads/' + files.logo[0].filename;
            console.log('Logo file uploaded (PUT):', files.logo[0].filename);
            console.log('Logo URL set to (PUT):', body.logo);
        }
        // Handle remove flags
        if (body.removePhoto === 'true' || body.removePhoto === true) {
            body.photo = null;
            console.log('Removing photo as requested');
        }
        if (body.removeLogo === 'true' || body.removeLogo === true) {
            body.logo = null;
            console.log('Removing logo as requested');
        }
        // Handle external URLs if provided
        if (body.photoUrl && !body.photo) {
            body.photo = body.photoUrl;
        }
        if (body.logoUrl && !body.logo) {
            body.logo = body.logoUrl;
        }
        console.log('Final body to update:', JSON.stringify(body, null, 2));
        const shop = yield Shop_1.default.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
        if (!shop)
            return next({ status: 404, message: 'Shop not found' });
        console.log('Updated shop data:', JSON.stringify(shop, null, 2));
        console.log('Shop photo field:', shop.photo);
        console.log('Shop logo field:', shop.logo);
        res.json({ success: true, data: shop, message: 'Shop updated' });
    }
    catch (err) {
        console.error('Shop update error:', err);
        console.error('Error details:', JSON.stringify(err, null, 2));
        next({ status: 400, message: 'Failed to update shop', details: err });
    }
}));
router.delete('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const shop = yield Shop_1.default.findByIdAndDelete(req.params.id);
        if (!shop)
            return next({ status: 404, message: 'Shop not found' });
        res.json({ success: true, data: null, message: 'Shop deleted' });
    }
    catch (err) {
        next(err);
    }
}));
// Assign a courier to a shop
router.post('/:id/couriers/:courierId', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const shop = yield Shop_1.default.findById(req.params.id);
        if (!shop)
            return next({ status: 404, message: 'Shop not found' });
        const courierId = req.params.courierId;
        if (!shop.couriers)
            shop.couriers = [];
        if (!shop.couriers.some(id => id.toString() === courierId)) {
            shop.couriers.push(new mongoose_1.default.Types.ObjectId(courierId));
            yield shop.save();
        }
        res.json({ success: true, data: shop, message: 'Courier assigned to shop' });
    }
    catch (err) {
        next({ status: 400, message: 'Failed to assign courier', details: err });
    }
}));
// Unassign a courier from a shop
router.delete('/:id/couriers/:courierId', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const shop = yield Shop_1.default.findById(req.params.id);
        if (!shop)
            return next({ status: 404, message: 'Shop not found' });
        const courierId = req.params.courierId;
        if (shop.couriers) {
            shop.couriers = shop.couriers.filter(id => id.toString() !== courierId);
            yield shop.save();
        }
        res.json({ success: true, data: shop, message: 'Courier unassigned from shop' });
    }
    catch (err) {
        next({ status: 400, message: 'Failed to unassign courier', details: err });
    }
}));
// Get all couriers assigned to a shop
router.get('/:id/couriers', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const shop = yield Shop_1.default.findById(req.params.id).populate('couriers');
        if (!shop)
            return next({ status: 404, message: 'Shop not found' });
        res.json({ success: true, data: shop.couriers || [] });
    }
    catch (err) {
        next({ status: 400, message: 'Failed to get assigned couriers', details: err });
    }
}));
// Get all couriers not assigned to a shop (available for assignment)
router.get('/:id/available-couriers', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const shop = yield Shop_1.default.findById(req.params.id);
        if (!shop)
            return next({ status: 404, message: 'Shop not found' });
        const assignedIds = (shop.couriers || []).map(id => id.toString());
        // Find users with role 'courier' and _id not in assignedIds
        const availableCouriers = yield require('../models/User').default.find({
            role: 'courier',
            _id: { $nin: assignedIds },
        });
        res.json({ success: true, data: availableCouriers });
    }
    catch (err) {
        next({ status: 400, message: 'Failed to get available couriers', details: err });
    }
}));
// List all unassigned groups (shopId is null)
router.get('/groups/unassigned', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const groups = yield Group_1.default.find({ shopId: null });
        res.json({ success: true, data: groups });
    }
    catch (err) {
        next({ status: 400, message: 'Failed to fetch groups', details: err });
    }
}));
exports.default = router;
