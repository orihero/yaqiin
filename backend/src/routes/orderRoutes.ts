import { NextFunction, Request, Response, Router } from "express";
import { Markup } from "telegraf";
import courierBot from "../bots/courierBot";
import Order from "../models/Order";
import Product from "../models/Product";
import Shop from "../models/Shop";
import User from "../models/User";
import Setting from '../models/Setting';
import authMiddleware from "../utils/authMiddleware";
import { parseQuery } from "../utils/queryHelper";
import { escapeMarkdownV2, escapeMarkdownV2Url } from "../utils/telegram";
import { sendOrderCreatedTelegramNotification } from '../bots/controllers/telegramOrderNotification';

const router = Router();

router.get(
  "/",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { filter, page, limit, skip } = parseQuery(req, [
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
      const userRole = (req as any).user.role;
      if (userRole === "admin") {
        // Admin can see all orders - no additional filtering needed
      } else if (userRole === "shop_owner") {
        // Shop owners should see orders for their shops
        // If shopId is provided in query, it should match their shops
        // For now, we'll let them see orders for the specified shopId
        // TODO: Add logic to verify the shopId belongs to this shop owner
      } else if (userRole === "courier") {
        // Couriers should see orders assigned to them
        filter.courierId = (req as any).user._id;
      } else {
        // Regular users (clients) can only see their own orders
        filter.customerId = (req as any).user._id;
      }
      // Fetch orders and total count
      const [orders, total] = await Promise.all([
        Order.find(filter).skip(skip).limit(limit).lean(),
        Order.countDocuments(filter),
      ]);

      // Get all unique productIds from all orders
      const productIds = [
        ...new Set(
          orders.flatMap((order) =>
            order.items.map((item) => item.productId.toString())
          )
        ),
      ];

      // Fetch products and map by id
      const products = await Product.find(
        { _id: { $in: productIds } },
        { images: 1 }
      ).lean();
      const productImageMap = Object.fromEntries(
        products.map((p) => [p._id.toString(), p.images?.[0] || null])
      );

      // Attach image to each order item
      const ordersWithImages = orders.map((order) => ({
        ...order,
        items: order.items.map((item) => ({
          ...item,
          image: productImageMap[item.productId.toString()] || null,
        })),
      }));

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
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/:id",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const order = await Order.findById(req.params.id);
      if (!order) {
        next({ status: 404, message: "Order not found" });
        return;
      }
      res.json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log("[Order Create] Incoming body:", req.body);
      // Only use allowed fields from client
      const { shopId, items, deliveryAddress, paymentMethod } = req.body;
      // Calculate itemsTotal
      const itemsTotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
      // Fetch delivery_fee and service_fee from settings
      const [deliveryFeeSetting, serviceFeeSetting] = await Promise.all([
        Setting.findOne({ key: 'delivery_fee', isActive: true }),
        Setting.findOne({ key: 'service_fee', isActive: true })
      ]);
      const deliveryFee = deliveryFeeSetting ? Number(deliveryFeeSetting.value) : 0;
      const serviceFee = serviceFeeSetting ? Number(serviceFeeSetting.value) : 0;
      const tax = 0;
      const discount = 0;
      const total = itemsTotal + deliveryFee + serviceFee + tax - discount;
      const pricing = { itemsTotal, deliveryFee, serviceFee, tax, discount, total };
      // Always set status to 'created' on backend
      const orderData = {
        shopId,
        items,
        deliveryAddress,
        paymentMethod,
        pricing,
        status: "created",
        ...(req.body.courierId ? { courierId: req.body.courierId } : {})
      };
      const order = new Order(orderData);
      await order.save();
      console.log("[Order Create] Saved order:", order);

      // --- Notification logic ---
      // Find the shop and client, then send Telegram notification
      const shop = await Shop.findById(order.shopId);
      const client = await User.findById(order.customerId);
      await sendOrderCreatedTelegramNotification(order, shop, client);
      // --- End notification logic ---

      res
        .status(201)
        .json({ success: true, data: order, message: "Order created" });
    } catch (err: any) {
      console.error("[Order Create] Error:", err);
      next({ status: 400, message: "Failed to create order", details: err });
    }
  }
);

// Client order creation endpoint
router.post(
  "/client",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
      const itemsTotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
      // Fetch delivery_fee and service_fee from settings
      const [deliveryFeeSetting, serviceFeeSetting] = await Promise.all([
        Setting.findOne({ key: 'delivery_fee', isActive: true }),
        Setting.findOne({ key: 'service_fee', isActive: true })
      ]);
      const deliveryFee = deliveryFeeSetting ? Number(deliveryFeeSetting.value) : 0;
      const serviceFee = serviceFeeSetting ? Number(serviceFeeSetting.value) : 0;
      const tax = 0;
      const discount = 0;
      const total = itemsTotal + deliveryFee + serviceFee + tax - discount;
      const pricing = { itemsTotal, deliveryFee, serviceFee, tax, discount, total };
      // Always set status to 'created' and paymentStatus to 'pending' on backend
      const orderData = {
        shopId,
        items,
        deliveryAddress,
        paymentMethod,
        pricing,
        status: "created",
        paymentStatus: "pending",
        customerId: (req as any).user._id,
        ...(req.body.courierId ? { courierId: req.body.courierId } : {})
      };
      const order = new Order(orderData);
      await order.save();
      // Send Telegram notification to shop group
      const shop = await Shop.findById(order.shopId);
      const client = await User.findById(order.customerId);
      await sendOrderCreatedTelegramNotification(order, shop, client);
      res.status(201).json({ success: true, data: order, message: "Order created" });
    } catch (err: any) {
      console.error("[Order Create - Client] Error:", err);
      next({ status: 400, message: "Failed to create order", details: err });
    }
  }
);

router.put(
  "/:id",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const order = await Order.findById(req.params.id);
      if (!order) {
        next({ status: 404, message: "Order not found" });
        return;
      }

      const user = (req as any).user;
      const newStatus = req.body.status;
      const isClient = user && user.role === "client";
      const isShop = user && user.role === "shop_owner";
      const isCourier = user && user.role === "courier";

      // Enforce status transitions
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
              message:
                "You can only cancel before the courier picks up the order.",
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

      // Allow other status transitions as needed (add more rules if required)

      // Update order
      Object.assign(order, req.body);
      await order.save();
      res.json({ success: true, data: order, message: "Order updated" });
    } catch (err: any) {
      next({ status: 400, message: "Failed to update order", details: err });
    }
  }
);

router.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const order = await Order.findByIdAndDelete(req.params.id);
      if (!order) {
        next({ status: 404, message: "Order not found" });
        return;
      }
      res.json({ success: true, data: null, message: "Order deleted" });
    } catch (err: any) {
      next(err);
    }
  }
);

export default router;
