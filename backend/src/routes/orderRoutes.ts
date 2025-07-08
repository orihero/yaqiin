import { Router } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import { parseQuery } from '../utils/queryHelper';
import authMiddleware from '../utils/authMiddleware';

const router = Router();

// List all orders for the authenticated user, with product images
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { filter, page, limit, skip } = parseQuery(req, ['orderNumber', 'status', 'paymentStatus', 'notes']);
    // Ensure only the current user's orders are returned
    filter.customerId = req.user._id;

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

router.get('/:id', async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return next({ status: 404, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json({ success: true, data: order, message: 'Order created' });
  } catch (err) {
    next({ status: 400, message: 'Failed to create order', details: err });
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!order) return next({ status: 404, message: 'Order not found' });
    res.json({ success: true, data: order, message: 'Order updated' });
  } catch (err) {
    next({ status: 400, message: 'Failed to update order', details: err });
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return next({ status: 404, message: 'Order not found' });
    res.json({ success: true, data: null, message: 'Order deleted' });
  } catch (err) {
    next(err);
  }
});

export default router; 