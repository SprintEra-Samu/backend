const bcrypt = require('bcrypt');
const { sequelize, Role, User } = require('./models');

const seed = async (exitOnFinish = true) => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true }); // Reset DB for testing

    console.log('Database synced. Seeding started...');

    const adminRole = await Role.create({ name: 'Yönetici' });
    const userRole = await Role.create({ name: 'Ekip Üyesi' });

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash('admin123', salt);

    const adminUser = await User.create({
      name: 'Admin Kullanıcısı',
      email: 'admin@sprintera.com',
      password_hash,
      role_id: adminRole.id
    });

    const memberUser = await User.create({
      name: 'Test Üyesi',
      email: 'test@sprintera.com',
      password_hash: await bcrypt.hash('test1234', salt),
      role_id: userRole.id
    });

    console.log('Seeding completed successfully!');
    if (exitOnFinish) {
      process.exit(0);
    }
    return { adminRole, userRole, adminUser, memberUser };
  } catch (err) {
    console.error('Seeding error:', err);
    if (exitOnFinish) {
      process.exit(1);
    }
    throw err;
  }
};

if (require.main === module) {
  seed(true);
}

module.exports = seed;
