import { Router, Request, Response, NextFunction } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import Shop from '../models/Shop';
import User from '../models/User';
import Courier from '../models/Courier';
import { parseQuery } from '../utils/queryHelper';
import authMiddleware from '../utils/authMiddleware';
import mainBot from '../bots/mainBot';
import courierBot from '../bots/courierBot';
import { Markup } from 'telegraf';

const router = Router();

// List all orders for the authenticated user, with product images
router.get('/', authMiddleware, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { filter, page, limit, skip } = parseQuery(req, ['orderNumber', 'status', 'paymentStatus', 'notes']);
    // If user is not admin, only return their orders
    if ((req as any).user.role !== 'admin') {
      filter.customerId = (req as any).user!._id;
    }
    // Fetch orders and total count
    const [orders, total] = await Promise.all([
      Order.find(filter).skip(skip).limit(limit).lean(),
      Order.countDocuments(filter)
    ]);

    // Get all unique productIds from all orders
    const productIds = [
      ...new Set(orders.flatMap(order => order.items.map(item => item.productId.toString())))
    ];

    // Fetch products and map by id
    const products = await Product.find({ _id: { $in: productIds } }, { images: 1 }).lean();
    const productImageMap = Object.fromEntries(
      products.map(p => [p._id.toString(), p.images?.[0] || null])
    );

    // Attach image to each order item
    const ordersWithImages = orders.map(order => ({
      ...order,
      items: order.items.map(item => ({
        ...item,
        image: productImageMap[item.productId.toString()] || null
      }))
    }));

    res.json({
      success: true,
      data: ordersWithImages,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      next({ status: 404, message: 'Order not found' });
      return;
    }
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const order = new Order(req.body);
    await order.save();

    // --- Notification logic ---
    // Find the shop
    const shop = await Shop.findById(order.shopId);
    if (shop) {
      // Notify shop owner
      const owner = await User.findById(shop.ownerId);
      if (owner && owner.telegramId && owner.chat_id) {
        // Determine next step button text for shop owner
        const nextStepText = '🛠️ Start Packing';
        await mainBot.telegram.sendMessage(
          owner.chat_id,
          `🆕🛒 Yangi buyurtma!\nOrder ID: ${order._id}\nIltimos, buyurtmani ko'rib chiqing.`,
          Markup.inlineKeyboard([
            [
              Markup.button.callback(nextStepText, `order_next_${order._id}_shop`),
              Markup.button.callback('❌ Buyurtmani rad etish', `order_reject_${order._id}_shop`)
            ]
          ])
        );
      }
      // Notify couriers
      if (shop.couriers && shop.couriers.length > 0) {
        const couriers = await Courier.find({ _id: { $in: shop.couriers } });
        for (const courier of couriers) {
          // Get courier user
          const courierUser = await User.findById(courier.userId);
          if (courierUser && courierUser.telegramId && courierUser.chat_id) {
            // Determine next step button text for courier
            const nextStepText = '✅ Buyurtmani oldim';
            await courierBot.telegram.sendMessage(
              courierUser.chat_id,
              `🆕🚚 Yangi buyurtma!\nOrder ID: ${order._id}\nIltimos, buyurtmani qabul qiling.`,
              Markup.inlineKeyboard([
                [
                  Markup.button.callback(nextStepText, `order_next_${order._id}_courier`),
                  Markup.button.callback('❌ Buyurtmani rad etish', `order_reject_${order._id}_courier`)
                ]
              ])
            );
          }
        }
      }
    }
    // --- End notification logic ---

    res.status(201).json({ success: true, data: order, message: 'Order created' });
  } catch (err) {
    next({ status: 400, message: 'Failed to create order', details: err });
  }
});

router.put('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      next({ status: 404, message: 'Order not found' });
      return;
    }

    const user = (req as any).user;
    const newStatus = req.body.status;
    const isClient = user && user.role === 'client';
    const isShop = user && user.role === 'shop_owner';
    const isCourier = user && user.role === 'courier';

    // Enforce status transitions
    if (newStatus === 'cancelled_by_client') {
      if (!isClient) {
        res.status(403).json({ success: false, message: 'Only clients can cancel orders.' });
        return;
      }
      if (!['created', 'packing'].includes(order.status)) {
        res.status(400).json({ success: false, message: 'You can only cancel before the courier picks up the order.' });
        return;
      }
    }
    if (newStatus === 'rejected_by_shop') {
      if (!isShop) {
        res.status(403).json({ success: false, message: 'Only shop owners can reject orders.' });
        return;
      }
      if (!['created', 'packing'].includes(order.status)) {
        res.status(400).json({ success: false, message: 'Shop can only reject before courier picks up.' });
        return;
      }
    }
    if (newStatus === 'rejected_by_courier') {
      if (!isCourier) {
        res.status(403).json({ success: false, message: 'Only couriers can reject orders.' });
        return;
      }
      if (order.status !== 'courier_picked') {
        res.status(400).json({ success: false, message: 'Courier can only reject after picking up.' });
        return;
      }
    }

    // Allow other status transitions as needed (add more rules if required)

    // Update order
    Object.assign(order, req.body);
    await order.save();
    res.json({ success: true, data: order, message: 'Order updated' });
  } catch (err) {
    next({ status: 400, message: 'Failed to update order', details: err });
  }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      next({ status: 404, message: 'Order not found' });
      return;
    }
    res.json({ success: true, data: null, message: 'Order deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;