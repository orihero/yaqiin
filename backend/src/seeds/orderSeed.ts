import Order from '../models/Order';
import User from '../models/User';
import Product from '../models/Product';
import Shop from '../models/Shop';

function randomFrom(arr: any[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const paymentStatuses = ['pending', 'paid', 'failed'];
const orderStatuses = ['pending', 'processing', 'delivered', 'cancelled'];

export default async function orderSeed() {
  // Remove all orders
  await Order.deleteMany({});

  const clients = await User.find({ role: 'client' });
  const couriers = await User.find({ role: 'courier' });
  const products = await Product.find();
  const shops: any[] = await Shop.find();
  if (clients.length === 0 || couriers.length === 0 || products.length === 0 || shops.length === 0) {
    throw new Error('Clients, couriers, products, or shops not seeded.');
  }
  let total = 0;
  for (let i = 0; i < 30; i++) {
    const client = randomFrom(clients);
    const courier = randomFrom(couriers);
    const product = randomFrom(products);
    const shop = shops.find(s => (s as any)._id.equals(product.shopId)) || randomFrom(shops);
    const quantity = Math.floor(Math.random() * 5) + 1;
    const itemSubtotal = product.price * quantity;
    const items = [{
      productId: product._id,
      name: product.name.uz,
      price: product.price,
      quantity,
      unit: product.unit,
      subtotal: itemSubtotal,
    }];
    const pricing = {
      itemsTotal: itemSubtotal,
      deliveryFee: 10000,
      serviceFee: 2000,
      tax: 0,
      discount: 0,
      total: itemSubtotal + 10000 + 2000,
    };
    const deliveryAddress = {
      title: 'Uy',
      street: shop.address.street,
      city: shop.address.city,
      district: shop.address.district,
      coordinates: shop.address.coordinates,
      notes: 'Yetkazib berish uchun',
    };
    await Order.create({
      customerId: client._id,
      shopId: shop._id,
      courierId: courier._id,
      items,
      pricing,
      deliveryAddress,
      paymentMethod: 'cash_on_delivery',
      paymentStatus: randomFrom(paymentStatuses),
      status: randomFrom(orderStatuses),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    total++;
  }
  console.log('Seeded orders:', total);
} 