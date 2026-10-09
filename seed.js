const bcrypt = require('bcrypt');
const { sequelize, Role, User } = require('./models');

const seed = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true }); // Reset DB for testing

    console.log('Database synced. Seeding started...');

    const adminRole = await Role.create({ name: 'Yönetici' });
    const userRole = await Role.create({ name: 'Ekip Üyesi' });

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash('admin123', salt);

    await User.create({
      name: 'Admin Kullanıcısı',
      email: 'admin@sprintera.com',
      password_hash,
      role_id: adminRole.id
    });

    await User.create({
      name: 'Test Üyesi',
      email: 'test@sprintera.com',
      password_hash: await bcrypt.hash('test1234', salt),
      role_id: userRole.id
    });

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seed();
