import Product from '../models/Product';
import Shop from '../models/Shop';
import Category from '../models/Category';

const productData = [
  { uz: 'Olma', ru: 'Яблоко', price: 12000, image: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce', category: 'Mevalar' },
  { uz: 'Banan', ru: 'Банан', price: 18000, image: 'https://images.unsplash.com/photo-1574226516831-e1dff420e8e9', category: 'Mevalar' },
  { uz: 'Pomidor', ru: 'Помидор', price: 9000, image: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc', category: 'Sabzavotlar' },
  { uz: 'Bodring', ru: 'Огурец', price: 8000, image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399', category: 'Sabzavotlar' },
  { uz: 'Mol go‘shti', ru: 'Говядина', price: 85000, image: 'https://images.unsplash.com/photo-1606788075761-9c3e1c8e6c9e', category: 'Go‘sht' },
  { uz: 'Sut', ru: 'Молоко', price: 10000, image: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c', category: 'Sut mahsulotlari' },
  { uz: 'Qatiq', ru: 'Кефир', price: 12000, image: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c', category: 'Sut mahsulotlari' },
  { uz: 'Non', ru: 'Хлеб', price: 4000, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836', category: 'Non va pishiriqlar' },
  { uz: 'Shokolad', ru: 'Шоколад', price: 15000, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836', category: 'Shirinliklar' },
  { uz: 'Baliq', ru: 'Рыба', price: 60000, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836', category: 'Baliq' },
  { uz: 'Yog‘', ru: 'Масло', price: 25000, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836', category: 'Yog‘lar' },
  { uz: 'Guruch', ru: 'Рис', price: 14000, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836', category: 'Guruch va don' },
  { uz: 'Qand', ru: 'Сахар', price: 9000, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836', category: 'Shirinliklar' },
  { uz: 'Tuxum', ru: 'Яйцо', price: 12000, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836', category: 'Sut mahsulotlari' },
  { uz: 'Piyoz', ru: 'Лук', price: 7000, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836', category: 'Sabzavotlar' },
  { uz: 'Sabzi', ru: 'Морковь', price: 8000, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836', category: 'Sabzavotlar' },
  { uz: 'Kartoshka', ru: 'Картошка', price: 6000, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836', category: 'Sabzavotlar' },
  { uz: 'Qovun', ru: 'Дыня', price: 20000, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836', category: 'Mevalar' },
  { uz: 'Tarvuz', ru: 'Арбуз', price: 18000, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836', category: 'Mevalar' },
  { uz: 'Pepsi', ru: 'Пепси', price: 9000, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836', category: 'Ichimliklar' }
];

function randomFrom(arr: any[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default async function productSeed() {
  // Remove all products
  await Product.deleteMany({});

  const shops = await Shop.find();
  const categories = await Category.find();
  if (shops.length === 0 || categories.length === 0) {
    throw new Error('Shops or categories not seeded.');
  }
  let total = 0;
  for (const shop of shops) {
    for (let i = 0; i < 5; i++) {
      const prod = randomFrom(productData);
      const category = categories.find(c => c.name.uz === prod.category);
      if (!category) continue;
      const exists = await Product.findOne({ 'name.uz': prod.uz, shopId: shop._id });
      if (!exists) {
        await Product.create({
          name: { uz: prod.uz, ru: prod.ru },
          shopId: shop._id,
          categoryId: category._id,
          price: prod.price,
          unit: 'dona',
          stock: { quantity: Math.floor(Math.random() * 100) + 1, unit: 'dona' },
          images: [prod.image],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        total++;
      }
    }
  }
  console.log('Seeded products:', total);
} 