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
const Order_1 = __importDefault(require("../models/Order"));
const Product_1 = __importDefault(require("../models/Product"));
const Shop_1 = __importDefault(require("../models/Shop"));
const User_1 = __importDefault(require("../models/User"));
const Setting_1 = __importDefault(require("../models/Setting"));
const authMiddleware_1 = __importDefault(require("../utils/authMiddleware"));
const queryHelper_1 = require("../utils/queryHelper");
const telegramOrderNotification_1 = require("../bots/controllers/telegramOrderNotification");
const mainBot_1 = __importDefault(require("../bots/mainBot"));
// Function to send order status update notification to client
function sendOrderStatusUpdateNotification(telegramId, order, newStatus, oldStatus) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(`[Notification] Starting notification for telegramId: ${telegramId}, order: ${order.orderNumber}, status: ${oldStatus} -> ${newStatus}`);
            const statusMessages = {
                'created': '📝 Your order has been created and is being processed',
                'operator_confirmed': '✅ Your order has been confirmed by our operator',
                'packing': '📦 Your order is being packed',
                'packed': '📦 Your order has been packed and is ready for pickup',
                'courier_picked': '🚚 Your order has been picked up by the courier',
                'delivered': '🎉 Your order has been delivered!',
                'paid': '💰 Payment for your order has been received',
                'rejected_by_shop': '❌ Your order was rejected by the shop',
                'rejected_by_courier': '❌ Your order was rejected by the courier',
                'cancelled_by_client': '🚫 Your order has been cancelled'
            };
            const message = statusMessages[newStatus] || `📋 Your order status has been updated to: ${newStatus}`;
            const notificationText = `🛍️ *Order Update*\n\n` +
                `Order #${order.orderNumber}\n` +
                `Status: ${message}\n\n` +
                `Previous status: ${oldStatus}\n` +
                `New status: ${newStatus}`;
            console.log(`[Notification] Sending message:`, notificationText);
            yield mainBot_1.default.telegram.sendMessage(telegramId, notificationText, { parse_mode: 'Markdown' });
            console.log(`[Notification] Message sent successfully to ${telegramId}`);
        }
        catch (error) {
            console.error('Failed to send order status notification:', error);
            console.error('Error details:', error);
        }
    });
}
const router = (0, express_1.Router)();
router.get("/", authMiddleware_1.default, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { filter, page, limit, skip } = (0, queryHelper_1.parseQuery)(req, [
            "orderNumber",
            "status",
            "paymentStatus",
            "notes",
        ]);
        // Handle shopId filter if provided
        if (req.query.shopId) {
            filter.shopId = req.query.shopId;
        }
        // Role-based filtering
        const userRole = req.user.role;
        if (userRole === "admin") {
            // Admin can see all orders - no additional filtering needed
        }
        else if (userRole === "shop_owner") {
            // Shop owners should see orders for their shops
            // If shopId is provided in query, it should match their shops
            // For now, we'll let them see orders for the specified shopId
            // TODO: Add logic to verify the shopId belongs to this shop owner
        }
        else if (userRole === "courier") {
            // Couriers should see orders assigned to them
            filter.courierId = req.user._id;
        }
        else {
            // Regular users (clients) can only see their own orders
            filter.customerId = req.user._id;
        }
        // Fetch orders and total count
        const [orders, total] = yield Promise.all([
            Order_1.default.find(filter).skip(skip).limit(limit).lean(),
            Order_1.default.countDocuments(filter),
        ]);
        // Get all unique productIds from all orders
        const productIds = [
            ...new Set(orders.flatMap((order) => order.items.map((item) => item.productId.toString()))),
        ];
        // Fetch products and map by id
        const products = yield Product_1.default.find({ _id: { $in: productIds } }, { images: 1 }).lean();
        const productImageMap = Object.fromEntries(products.map((p) => { var _a; return [p._id.toString(), ((_a = p.images) === null || _a === void 0 ? void 0 : _a[0]) || null]; }));
        // Attach image to each order item
        const ordersWithImages = orders.map((order) => (Object.assign(Object.assign({}, order), { items: order.items.map((item) => (Object.assign(Object.assign({}, item), { image: productImageMap[item.productId.toString()] || null }))) })));
        res.json({
            success: true,
            data: ordersWithImages,
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
router.get("/:id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield Order_1.default.findById(req.params.id);
        if (!order) {
            next({ status: 404, message: "Order not found" });
            return;
        }
        res.json({ success: true, data: order });
    }
    catch (err) {
        next(err);
    }
}));
router.post("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("[Order Create] Incoming body:", req.body);
        // Only use allowed fields from client
        const { shopId, items, deliveryAddress, paymentMethod } = req.body;
        // Calculate itemsTotal
        const itemsTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        // Fetch delivery_fee and service_fee from settings
        const [deliveryFeeSetting, serviceFeeSetting] = yield Promise.all([
            Setting_1.default.findOne({ key: 'delivery_fee', isActive: true }),
            Setting_1.default.findOne({ key: 'service_fee', isActive: true })
        ]);
        const deliveryFee = deliveryFeeSetting ? Number(deliveryFeeSetting.value) : 0;
        const serviceFee = serviceFeeSetting ? Number(serviceFeeSetting.value) : 0;
        const tax = 0;
        const discount = 0;
        const total = itemsTotal + deliveryFee + serviceFee + tax - discount;
        const pricing = { itemsTotal, deliveryFee, serviceFee, tax, discount, total };
        // Always set status to 'created' on backend
        const orderData = Object.assign({ shopId,
            items,
            deliveryAddress,
            paymentMethod,
            pricing, status: "created" }, (req.body.courierId ? { courierId: req.body.courierId } : {}));
        const order = new Order_1.default(orderData);
        yield order.save();
        console.log("[Order Create] Saved order:", order);
        // --- Notification logic ---
        // Find the shop and client, then send Telegram notification
        const shop = yield Shop_1.default.findById(order.shopId);
        const client = yield User_1.default.findById(order.customerId);
        // Fetch product images for the order items
        const productIds = order.items.map((item) => item.productId);
        const Product = require('../models/Product').default;
        const products = yield Product.find({ _id: { $in: productIds } }).select('images name');
        // Create a map of productId to images for quick lookup
        const productImagesMap = new Map();
        products.forEach((product) => {
            productImagesMap.set(product._id.toString(), product.images || []);
        });
        // Add images to order items
        const orderWithImages = Object.assign(Object.assign({}, order.toObject()), { items: order.items.map((item) => (Object.assign(Object.assign({}, item), { images: productImagesMap.get(item.productId.toString()) || [] }))) });
        yield (0, telegramOrderNotification_1.sendOrderCreatedTelegramNotification)(orderWithImages, shop, client);
        // --- End notification logic ---
        res
            .status(201)
            .json({ success: true, data: order, message: "Order created" });
    }
    catch (err) {
        console.error("[Order Create] Error:", err);
        next({ status: 400, message: "Failed to create order", details: err });
    }
}));
// Client order creation endpoint
router.post("/client", authMiddleware_1.default, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { shopId, items, deliveryAddress, paymentMethod } = req.body;
        // Validate deliveryAddress coordinates
        if (!deliveryAddress || !deliveryAddress.coordinates || typeof deliveryAddress.coordinates.lat !== 'number' || typeof deliveryAddress.coordinates.lng !== 'number') {
            res.status(400).json({
                success: false,
                error: {
                    code: 400,
                    message: "Missing or invalid delivery address coordinates (lat, lng) required.",
                    details: { deliveryAddress }
                }
            });
            return;
        }
        // Calculate itemsTotal
        const itemsTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        // Fetch delivery_fee and service_fee from settings
        const [deliveryFeeSetting, serviceFeeSetting] = yield Promise.all([
            Setting_1.default.findOne({ key: 'delivery_fee', isActive: true }),
            Setting_1.default.findOne({ key: 'service_fee', isActive: true })
        ]);
        const deliveryFee = deliveryFeeSetting ? Number(deliveryFeeSetting.value) : 0;
        const serviceFee = serviceFeeSetting ? Number(serviceFeeSetting.value) : 0;
        const tax = 0;
        const discount = 0;
        const total = itemsTotal + deliveryFee + serviceFee + tax - discount;
        const pricing = { itemsTotal, deliveryFee, serviceFee, tax, discount, total };
        // Always set status to 'created' and paymentStatus to 'pending' on backend
        const orderData = Object.assign({ shopId,
            items,
            deliveryAddress,
            paymentMethod,
            pricing, status: "created", paymentStatus: "pending", customerId: req.user._id }, (req.body.courierId ? { courierId: req.body.courierId } : {}));
        const order = new Order_1.default(orderData);
        yield order.save();
        // Send Telegram notification to shop group
        const shop = yield Shop_1.default.findById(order.shopId);
        const client = yield User_1.default.findById(order.customerId);
        // Fetch product images for the order items
        const productIds = order.items.map((item) => item.productId);
        const Product = require('../models/Product').default;
        const products = yield Product.find({ _id: { $in: productIds } }).select('images name');
        // Create a map of productId to images for quick lookup
        const productImagesMap = new Map();
        products.forEach((product) => {
            productImagesMap.set(product._id.toString(), product.images || []);
        });
        // Add images to order items
        const orderWithImages = Object.assign(Object.assign({}, order.toObject()), { items: order.items.map((item) => (Object.assign(Object.assign({}, item), { images: productImagesMap.get(item.productId.toString()) || [] }))) });
        yield (0, telegramOrderNotification_1.sendOrderCreatedTelegramNotification)(orderWithImages, shop, client);
        res.status(201).json({ success: true, data: order, message: "Order created" });
    }
    catch (err) {
        console.error("[Order Create - Client] Error:", err);
        next({ status: 400, message: "Failed to create order", details: err });
    }
}));
router.put("/:id", authMiddleware_1.default, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield Order_1.default.findById(req.params.id);
        if (!order) {
            next({ status: 404, message: "Order not found" });
            return;
        }
        const user = req.user;
        const newStatus = req.body.status;
        const isAdmin = user && user.role === "admin";
        const isClient = user && user.role === "client";
        const isShop = user && user.role === "shop_owner";
        const isCourier = user && user.role === "courier";
        // Admins can update any order status without restrictions
        if (!isAdmin) {
            // Enforce status transitions for non-admin users
            if (newStatus === "cancelled_by_client") {
                if (!isClient) {
                    res
                        .status(403)
                        .json({
                        success: false,
                        message: "Only clients can cancel orders.",
                    });
                    return;
                }
                if (!["created", "packing"].includes(order.status)) {
                    res
                        .status(400)
                        .json({
                        success: false,
                        message: "You can only cancel before the courier picks up the order.",
                    });
                    return;
                }
            }
            if (newStatus === "rejected_by_shop") {
                if (!isShop) {
                    res
                        .status(403)
                        .json({
                        success: false,
                        message: "Only shop owners can reject orders.",
                    });
                    return;
                }
                if (!["created", "packing"].includes(order.status)) {
                    res
                        .status(400)
                        .json({
                        success: false,
                        message: "Shop can only reject before courier picks up.",
                    });
                    return;
                }
            }
            if (newStatus === "rejected_by_courier") {
                if (!isCourier) {
                    res
                        .status(403)
                        .json({
                        success: false,
                        message: "Only couriers can reject orders.",
                    });
                    return;
                }
                if (order.status !== "courier_picked") {
                    res
                        .status(400)
                        .json({
                        success: false,
                        message: "Courier can only reject after picking up.",
                    });
                    return;
                }
            }
        }
        // Store the old status for notification purposes
        const oldStatus = order.status;
        // Update order
        Object.assign(order, req.body);
        yield order.save();
        // Send notification to client if status changed and user is admin
        if (isAdmin && newStatus && newStatus !== oldStatus) {
            console.log(`[Order Update] Admin ${user._id} updating order ${order._id} from ${oldStatus} to ${newStatus}`);
            try {
                const client = yield User_1.default.findById(order.customerId);
                console.log(`[Order Update] Found client:`, client ? { id: client._id, telegramId: client.telegramId } : 'null');
                if (client && client.telegramId) {
                    console.log(`[Order Update] Sending notification to client ${client.telegramId}`);
                    yield sendOrderStatusUpdateNotification(client.telegramId, order, newStatus, oldStatus);
                    console.log(`[Order Update] Notification sent successfully`);
                }
                else {
                    console.log(`[Order Update] No client or telegramId found, skipping notification`);
                }
            }
            catch (notificationError) {
                console.error("Failed to send order status notification:", notificationError);
                // Don't fail the request if notification fails
            }
        }
        else {
            console.log(`[Order Update] Not sending notification - isAdmin: ${isAdmin}, newStatus: ${newStatus}, oldStatus: ${oldStatus}, statusChanged: ${newStatus !== oldStatus}`);
        }
        res.json({ success: true, data: order, message: "Order updated" });
    }
    catch (err) {
        next({ status: 400, message: "Failed to update order", details: err });
    }
}));
router.delete("/:id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield Order_1.default.findByIdAndDelete(req.params.id);
        if (!order) {
            next({ status: 404, message: "Order not found" });
            return;
        }
        res.json({ success: true, data: null, message: "Order deleted" });
    }
    catch (err) {
        next(err);
    }
}));
exports.default = router;
