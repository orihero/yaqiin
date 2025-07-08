import User from '../models/User';
import Courier from '../models/Courier';
import bcrypt from 'bcryptjs';

const uzbekNames = [
  'Aziz', 'Jasur', 'Diyor', 'Shahzod', 'Bekzod', 'Ulugbek', 'Javohir', 'Sardor', 'Oybek', 'Shavkat',
  'Dilshod', 'Farruh', 'Bobur', 'Sherzod', 'Rustam', 'Jahongir', 'Akmal', 'Kamol', 'Anvar', 'Islom',
  'Gulnora', 'Dilnoza', 'Malika', 'Nodira', 'Zilola', 'Rayhona', 'Sevara', 'Lola', 'Gulbahor', 'Shahnoza',
  'Madina', 'Zarina', 'Dildora', 'Feruza', 'Nilufar', 'Gulchehra', 'Nargiza', 'Yulduz', 'Shaxzoda', 'Mukhayyo'
];
const uzbekSurnames = [
  'Toshpulatov', 'Karimov', 'Rakhimov', 'Islomov', 'Saidov', 'Ergashev', 'Yusupov', 'Abdullayev', 'Nazarov', 'Mirzayev',
  'Xudoyberdiyev', 'Qodirov', 'Sultonov', 'Mamatqulov', 'Tojiboyev', 'Juraev', 'Tursunov', 'Sobirov', 'Ganiev', 'Kurbanov',
  'Olimova', 'Rasulova', 'Islomova', 'Saidova', 'Ergasheva', 'Yusupova', 'Abdullayeva', 'Nazarova', 'Mirzayeva', 'Qodirova',
  'Sultonova', 'Mamatqulova', 'Tojiboyeva', 'Juraeva', 'Tursunova', 'Sobirova', 'Ganieva', 'Kurbanova'
];

function randomFrom(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateUser(role: string, i: number) {
  const firstName = randomFrom(uzbekNames);
  const lastName = randomFrom(uzbekSurnames);
  return {
    telegramId: `${role}-${i}-${Math.floor(Math.random() * 100000)}`,
    username: `${role}${i}`,
    firstName,
    lastName,
    role,
    status: 'active',
    password: 'test1234',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export default async function userSeed() {
  // Remove all users and couriers
  await User.deleteMany({});
  await Courier.deleteMany({});

  // Clients
  const clients = Array.from({ length: 100 }, (_, i) => generateUser('client', i));
  // Couriers
  const couriers = Array.from({ length: 10 }, (_, i) => generateUser('courier', i));
  // Shop Owners
  const shopOwners = Array.from({ length: 5 }, (_, i) => generateUser('shop_owner', i));
  // Admins (besides the main one)
  const admins = Array.from({ length: 3 }, (_, i) => generateUser('admin', i + 1));

  const allUsers = [...clients, ...couriers, ...shopOwners, ...admins];

  for (const user of allUsers) {
    const exists = await User.findOne({ telegramId: user.telegramId });
    if (!exists) {
      const createdUser = await User.create(user);
      // If courier, create Courier entry
      if (user.role === 'courier') {
        await Courier.create({
          userId: createdUser._id,
          vehicleType: 'bike',
          availability: 'available',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }
  }
  console.log('Seeded users: 100 clients, 10 couriers, 5 shop owners, 3 admins');
} 