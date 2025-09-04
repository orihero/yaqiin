import Shop from '../models/Shop';
import User from '../models/User';

const shopNames = [
  'Oqtepa Savdo', 'Baraka Market', 'Do‘stlik Supermarket', 'Yangi Hayot', 'Farovon Savdo'
];

const defaultAddress = (i: number) => ({
  street: `Ko‘cha ${i + 1}`,
  city: 'Toshkent',
  district: 'Yunusobod',
  coordinates: { lat: 41.3 + i * 0.01, lng: 69.2 + i * 0.01 },
});

const defaultContactInfo = (i: number) => ({
  phoneNumber: `+9989012345${i}0`,
  email: `shop${i + 1}@yaqiin.uz`,
  telegramUsername: `shop${i + 1}_tg`,
});

const defaultOperatingHours = {
  monday:    { open: '09:00', close: '21:00', isOpen: true },
  tuesday:   { open: '09:00', close: '21:00', isOpen: true },
  wednesday: { open: '09:00', close: '21:00', isOpen: true },
  thursday:  { open: '09:00', close: '21:00', isOpen: true },
  friday:    { open: '09:00', close: '21:00', isOpen: true },
  saturday:  { open: '09:00', close: '21:00', isOpen: true },
  sunday:    { open: '09:00', close: '21:00', isOpen: true },
};

export default async function shopSeed() {
  // Remove all shops
  await Shop.deleteMany({});

  // Get shop owners
  const shopOwners = await User.find({ role: 'shop_owner' }).limit(5);
  if (shopOwners.length < 5) {
    throw new Error('Not enough shop owners to seed shops.');
  }
  const shops = [];
  for (let i = 0; i < 5; i++) {
    const name = shopNames[i];
    const owner = shopOwners[i];
    let shop = await Shop.findOne({ name });
    if (!shop) {
      shop = await Shop.create({
        name,
        ownerId: owner._id,
        address: defaultAddress(i),
        contactInfo: defaultContactInfo(i),
        operatingHours: defaultOperatingHours,
        status: 'active',
        // Sample photo and logo URLs for testing
        photo: `https://picsum.photos/400/300?random=${i + 1}`,
        logo: `https://picsum.photos/200/200?random=${i + 10}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    shops.push(shop);
  }
  console.log('Seeded shops:', shops.length);
  return shops;
} 