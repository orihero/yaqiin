import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/yaqiin';

async function createIndexes() {
  await mongoose.connect(MONGO_URI);

  // Users Collection
  await mongoose.connection.collection('users').createIndex({ telegramId: 1 }, { unique: true });
  await mongoose.connection.collection('users').createIndex({ role: 1, status: 1 });
  await mongoose.connection.collection('users').createIndex({ phoneNumber: 1 });

  // Shops Collection
  await mongoose.connection.collection('shops').createIndex({ ownerId: 1 });
  await mongoose.connection.collection('shops').createIndex({ status: 1 });
  await mongoose.connection.collection('shops').createIndex({ 'address.coordinates': '2dsphere' });

  // Products Collection
  await mongoose.connection.collection('products').createIndex({ shopId: 1, isActive: 1 });
  await mongoose.connection.collection('products').createIndex({ categoryId: 1, isActive: 1 });
  await mongoose.connection.collection('products').createIndex({ 'name.uz': 'text', 'name.ru': 'text', tags: 'text' });
  await mongoose.connection.collection('products').createIndex({ isFeatured: 1, isActive: 1 });

  // Orders Collection
  await mongoose.connection.collection('orders').createIndex({ customerId: 1, createdAt: -1 });
  await mongoose.connection.collection('orders').createIndex({ shopId: 1, status: 1 });
  await mongoose.connection.collection('orders').createIndex({ courierId: 1, status: 1 });
  await mongoose.connection.collection('orders').createIndex({ orderNumber: 1 }, { unique: true });
  await mongoose.connection.collection('orders').createIndex({ status: 1, createdAt: -1 });

  // Couriers Collection
  await mongoose.connection.collection('couriers').createIndex({ userId: 1 }, { unique: true });
  await mongoose.connection.collection('couriers').createIndex({ availability: 1, isActive: 1 });
  await mongoose.connection.collection('couriers').createIndex({ currentLocation: '2dsphere' });

  // Deliveries Collection
  await mongoose.connection.collection('deliveries').createIndex({ orderId: 1 }, { unique: true });
  await mongoose.connection.collection('deliveries').createIndex({ courierId: 1, status: 1 });
  await mongoose.connection.collection('deliveries').createIndex({ status: 1, createdAt: -1 });

  // Notifications Collection
  await mongoose.connection.collection('notifications').createIndex({ recipientId: 1, createdAt: -1 });
  await mongoose.connection.collection('notifications').createIndex({ status: 1, createdAt: -1 });
  await mongoose.connection.collection('notifications').createIndex({ isRead: 1, recipientId: 1 });

  // Reviews Collection
  await mongoose.connection.collection('reviews').createIndex({ targetType: 1, targetId: 1 });
  await mongoose.connection.collection('reviews').createIndex({ customerId: 1, createdAt: -1 });
  await mongoose.connection.collection('reviews').createIndex({ orderId: 1 }, { unique: true });

  // Analytics Collection
  await mongoose.connection.collection('analytics').createIndex({ date: 1, type: 1 });

  // Settings Collection
  await mongoose.connection.collection('settings').createIndex({ key: 1 }, { unique: true });

  // Chat Messages Collection
  await mongoose.connection.collection('chatMessages').createIndex({ conversationId: 1, createdAt: -1 });
  await mongoose.connection.collection('chatMessages').createIndex({ senderId: 1, receiverId: 1 });
  await mongoose.connection.collection('chatMessages').createIndex({ relatedOrderId: 1 });

  console.log('Indexes created successfully.');
  await mongoose.disconnect();
}

createIndexes().catch((err) => {
  console.error('Error creating indexes:', err);
  process.exit(1);
}); 