import User from '../models/User';
import Setting from '../models/Setting';

// Production admin credentials - these should be changed in production
const adminTelegramId = 'production-admin-telegram-id';
const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeThisPassword123!';

export default async function productionSeed() {
  console.log('Starting production seed...');

  // Remove all users and settings
  await User.deleteMany({});
  await Setting.deleteMany({});

  // Seed production admin user
  const admin = await User.findOne({ telegramId: adminTelegramId });
  if (!admin) {
    await User.create({
      telegramId: adminTelegramId,
      username: 'superadmin',
      firstName: 'Super',
      lastName: 'Admin',
      role: 'admin',
      status: 'active',
      password: adminPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('✅ Production super admin user created successfully.');
    console.log(`📧 Username: superadmin`);
    console.log(`🔑 Password: ${adminPassword}`);
    console.log(`⚠️  IMPORTANT: Change the password in production!`);
  } else {
    console.log('✅ Production super admin user already exists.');
  }

  // Seed essential production settings
  const essentialSettings = [
    {
      key: 'platform_name',
      value: 'yaqiin.uz',
      type: 'system',
      isActive: true,
    },
    {
      key: 'maintenance_mode',
      value: 'false',
      type: 'system',
      isActive: true,
    },
    {
      key: 'default_language',
      value: 'uz',
      type: 'system',
      isActive: true,
    },
  ];

  for (const settingData of essentialSettings) {
    const setting = await Setting.findOne({ key: settingData.key });
    if (!setting) {
      await Setting.create({
        ...settingData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`✅ Setting created: ${settingData.key}`);
    } else {
      console.log(`✅ Setting already exists: ${settingData.key}`);
    }
  }

  console.log('🎉 Production seed completed successfully!');
  console.log('📝 Only 1 super admin user and essential settings have been created.');
} 