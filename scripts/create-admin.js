const bcrypt = require('bcryptjs');
const { Role, User: UserModel } = require('../models/index');
require('dotenv').config();

async function createAdmin() {
  try {
    const email = process.argv[2] || 'admin@acme.com';
    const password = process.argv[3] || 'Admin@123';
    const companyId = process.argv[4];
    const name = process.argv[5] || 'Company Admin';

    if (!companyId) {
      console.error('Company ID (UUID) is required as the 4th argument');
      console.log('Usage: node scripts/create-admin.js <email> <password> <company_uuid> <name>');
      process.exit(1);
    }

    const password_hash = await bcrypt.hash(password, 10);

    const role = await Role.findOne({
      where: { company_id: companyId, name: 'Company Admin' }
    });

    if (!role) {
      console.error('Company Admin role not found for company', companyId);
      process.exit(1);
    }

    const roleId = role.id;

    const existing = await UserModel.findOne({
      where: { email }
    });

    if (existing) {
      await UserModel.update(
        {
          password_hash,
          name,
          is_active: true,
          is_deleted: false
        },
        { where: { email } }
      );
      console.log(`Admin user updated: ${email}`);
    } else {
      await UserModel.create({
        company_id: companyId,
        role_id: roleId,
        email,
        password_hash,
        name,
        is_active: true
      });
      console.log(`Admin user created: ${email}`);
    }

    console.log(`Password: ${password}`);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();

