import User from '../models/User';
import Setting from '../models/Setting';

const adminTelegramId = 'admin-telegram-id';
const adminPassword = 'admin123'; // Change this in production!

export default async function adminAndSettingSeed() {
  // Remove all users and settings
  await User.deleteMany({});
  await Setting.deleteMany({});

  // Seed admin user
  const admin = await User.findOne({ telegramId: adminTelegramId });
  if (!admin) {
    await User.create({
      telegramId: adminTelegramId,
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      status: 'active',
      password: adminPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('Admin user created.');
  } else {
    console.log('Admin user already exists.');
  }

  // Seed default setting
  const defaultSettingKey = 'platform_name';
  const setting = await Setting.findOne({ key: defaultSettingKey });
  if (!setting) {
    await Setting.create({
      key: defaultSettingKey,
      value: 'yaqiin.uz',
      type: 'system',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('Default setting created.');
  } else {
    console.log('Default setting already exists.');
  }
} 