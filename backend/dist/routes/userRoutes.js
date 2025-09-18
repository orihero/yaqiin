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
const User_1 = __importDefault(require("../models/User"));
const queryHelper_1 = require("../utils/queryHelper");
const Shop_1 = __importDefault(require("../models/Shop"));
const authMiddleware_1 = __importDefault(require("../utils/authMiddleware"));
const router = (0, express_1.Router)();
// Move this block above all parameterized routes
router.get("/me", authMiddleware_1.default, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findById(req.user.id);
        if (!user) {
            res
                .status(404)
                .json({
                success: false,
                error: { code: 404, message: "User not found" },
            });
            return;
        }
        res.json({ success: true, data: user });
    }
    catch (err) {
        res
            .status(500)
            .json({
            success: false,
            error: { code: 500, message: "Failed to fetch user profile" },
        });
    }
}));
// Update current user profile
router.put("/me", authMiddleware_1.default, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Only allow updating certain fields for security
        const allowedFields = [
            'firstName',
            'lastName',
            'phoneNumber',
            'email',
            'addresses',
            'preferences'
        ];
        const updateData = {};
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });
        const user = yield User_1.default.findByIdAndUpdate(req.user.id, updateData, { new: true });
        if (!user) {
            res
                .status(404)
                .json({
                success: false,
                error: { code: 404, message: "User not found" },
            });
            return;
        }
        res.json({ success: true, data: user, message: "Profile updated successfully" });
    }
    catch (err) {
        res
            .status(500)
            .json({
            success: false,
            error: { code: 500, message: "Failed to update user profile" },
        });
    }
}));
// List all users with pagination, filtering, and search
router.get("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { filter, page, limit, skip, search } = (0, queryHelper_1.parseQuery)(req, [
            "username",
            "firstName",
            "lastName",
            "phoneNumber",
            "email",
        ]);
        // Enhanced full name search
        if (search && search.includes(" ")) {
            const parts = search.trim().split(/\s+/);
            if (parts.length >= 2) {
                // Try both orders: firstName + lastName and lastName + firstName
                filter.$or = [
                    { $and: [
                            { firstName: { $regex: `^${parts[0]}`, $options: "i" } },
                            { lastName: { $regex: `^${parts.slice(1).join(" ")}`, $options: "i" } }
                        ] },
                    { $and: [
                            { firstName: { $regex: `^${parts.slice(1).join(" ")}`, $options: "i" } },
                            { lastName: { $regex: `^${parts[0]}`, $options: "i" } }
                        ] }
                ];
            }
        }
        const [users, total] = yield Promise.all([
            User_1.default.find(filter).skip(skip).limit(limit),
            User_1.default.countDocuments(filter),
        ]);
        res.json({
            success: true,
            data: users,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    }
    catch (err) {
        next(err);
    }
}));
// Get available shop owners (role: 'shop_owner' and no shop assigned)
router.get("/available-owners", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find all ownerIds that are already assigned to a shop
        const shops = yield Shop_1.default.find({}, "ownerId");
        const assignedOwnerIds = shops.map((shop) => String(shop.ownerId));
        // Find users with role 'shop_owner' and _id not in assignedOwnerIds
        const availableOwners = yield User_1.default.find({
            role: "shop_owner",
            _id: { $nin: assignedOwnerIds },
        });
        res.json({
            success: true,
            data: availableOwners,
        });
    }
    catch (err) {
        next(err);
    }
}));
// Get user by ID
router.get("/:id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findById(req.params.id);
        if (!user)
            return next({ status: 404, message: "User not found" });
        res.json({ success: true, data: user });
    }
    catch (err) {
        next(err);
    }
}));
// Create user
router.post("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = new User_1.default(req.body);
        yield user.save();
        res
            .status(201)
            .json({ success: true, data: user, message: "User created" });
    }
    catch (err) {
        next({ status: 400, message: "Failed to create user", details: err });
    }
}));
// Update user
router.put("/:id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        if (!user)
            return next({ status: 404, message: "User not found" });
        res.json({ success: true, data: user, message: "User updated" });
    }
    catch (err) {
        next({ status: 400, message: "Failed to update user", details: err });
    }
}));
// Delete user
router.delete("/:id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findByIdAndDelete(req.params.id);
        if (!user)
            return next({ status: 404, message: "User not found" });
        res.json({ success: true, data: null, message: "User deleted" });
    }
    catch (err) {
        next(err);
    }
}));
// Address management routes
// Add new address
router.post("/me/addresses", authMiddleware_1.default, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findById(req.user.id);
        if (!user) {
            res.status(404).json({
                success: false,
                error: { code: 404, message: "User not found" },
            });
            return;
        }
        const newAddress = Object.assign(Object.assign({}, req.body), { _id: new Date().getTime().toString() });
        // If this is the first address, make it default
        if (!user.addresses || user.addresses.length === 0) {
            newAddress.isDefault = true;
        }
        // If the new address is set as default, remove default from other addresses
        if (newAddress.isDefault && user.addresses) {
            user.addresses.forEach(addr => addr.isDefault = false);
        }
        user.addresses.push(newAddress);
        yield user.save();
        res.status(201).json({
            success: true,
            data: newAddress,
            message: "Address added successfully"
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            error: { code: 500, message: "Failed to add address" },
        });
    }
}));
// Update address
router.put("/me/addresses/:addressId", authMiddleware_1.default, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findById(req.user.id);
        if (!user) {
            res.status(404).json({
                success: false,
                error: { code: 404, message: "User not found" },
            });
            return;
        }
        const addressIndex = user.addresses.findIndex(addr => addr._id === req.params.addressId);
        if (addressIndex === -1) {
            res.status(404).json({
                success: false,
                error: { code: 404, message: "Address not found" },
            });
            return;
        }
        // If the address is being set as default, remove default from other addresses
        if (req.body.isDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
        }
        user.addresses[addressIndex] = Object.assign(Object.assign({}, user.addresses[addressIndex]), req.body);
        yield user.save();
        res.json({
            success: true,
            data: user.addresses[addressIndex],
            message: "Address updated successfully"
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            error: { code: 500, message: "Failed to update address" },
        });
    }
}));
// Delete address
router.delete("/me/addresses/:addressId", authMiddleware_1.default, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findById(req.user.id);
        if (!user) {
            res.status(404).json({
                success: false,
                error: { code: 404, message: "User not found" },
            });
            return;
        }
        const addressIndex = user.addresses.findIndex(addr => addr._id === req.params.addressId);
        if (addressIndex === -1) {
            res.status(404).json({
                success: false,
                error: { code: 404, message: "Address not found" },
            });
            return;
        }
        const deletedAddress = user.addresses[addressIndex];
        user.addresses.splice(addressIndex, 1);
        // If the deleted address was default and there are other addresses, make the first one default
        if (deletedAddress.isDefault && user.addresses.length > 0) {
            user.addresses[0].isDefault = true;
        }
        yield user.save();
        res.json({
            success: true,
            data: null,
            message: "Address deleted successfully"
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            error: { code: 500, message: "Failed to delete address" },
        });
    }
}));
// Set address as default
router.patch("/me/addresses/:addressId/default", authMiddleware_1.default, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findById(req.user.id);
        if (!user) {
            res.status(404).json({
                success: false,
                error: { code: 404, message: "User not found" },
            });
            return;
        }
        const addressIndex = user.addresses.findIndex(addr => addr._id === req.params.addressId);
        if (addressIndex === -1) {
            res.status(404).json({
                success: false,
                error: { code: 404, message: "Address not found" },
            });
            return;
        }
        // Remove default from all addresses
        user.addresses.forEach(addr => addr.isDefault = false);
        // Set the specified address as default
        user.addresses[addressIndex].isDefault = true;
        yield user.save();
        res.json({
            success: true,
            data: user.addresses[addressIndex],
            message: "Default address updated successfully"
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            error: { code: 500, message: "Failed to set default address" },
        });
    }
}));
exports.default = router;
