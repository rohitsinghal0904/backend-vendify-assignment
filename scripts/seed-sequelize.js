const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const {
    sequelize,
    Company,
    Role,
    User
} = require('../models');

const ADMIN_PASSWORD = 'Admin@123';

async function seed() {
    console.log('🌱 Starting Sequelize seed...');

    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established');

        const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

        const company1Id = uuidv4();
        const company2Id = uuidv4();

        const companies = [
            { id: company1Id, name: 'Acme Corporation' },
            { id: company2Id, name: 'Tech Solutions Inc' }
        ];

        await Company.bulkCreate(companies, { ignoreDuplicates: true });
        console.log('🏢 Companies inserted');

        const roleCompany1Admin = uuidv4();
        const roleCompany1Store = uuidv4();
        const roleCompany1Finance = uuidv4();
        const roleCompany2Admin = uuidv4();
        const roleCompany2Store = uuidv4();

        const roles = [
            {
                id: roleCompany1Admin,
                company_id: company1Id,
                name: 'Company Admin',
                permissions: {
                    can_create_user: true,
                    can_update_user: true,
                    can_delete_user: true,
                    can_create_role: true,
                    can_update_role: true,
                    can_delete_role: true,
                    can_view_audit_logs: true
                }
            },
            {
                id: roleCompany1Store,
                company_id: company1Id,
                name: 'Store Manager',
                permissions: {
                    can_create_user: false,
                    can_update_user: false,
                    can_delete_user: false,
                    can_view_users: true
                }
            },
            {
                id: roleCompany1Finance,
                company_id: company1Id,
                name: 'Finance Manager',
                permissions: {
                    can_create_user: false,
                    can_update_user: false,
                    can_delete_user: false,
                    can_view_users: true
                }
            },
            {
                id: roleCompany2Admin,
                company_id: company2Id,
                name: 'Company Admin',
                permissions: {
                    can_create_user: true,
                    can_update_user: true,
                    can_delete_user: true,
                    can_create_role: true,
                    can_update_role: true,
                    can_delete_role: true,
                    can_view_audit_logs: true
                }
            },
            {
                id: roleCompany2Store,
                company_id: company2Id,
                name: 'Store Manager',
                permissions: {
                    can_create_user: false,
                    can_update_user: false,
                    can_delete_user: false,
                    can_view_users: true
                }
            }
        ];

        await Role.bulkCreate(roles, { ignoreDuplicates: true });
        console.log('🛡️  Roles inserted');

        const users = [
            {
                id: uuidv4(),
                company_id: company1Id,
                role_id: roleCompany1Admin,
                email: 'admin@acme.com',
                password_hash: passwordHash,
                name: 'Acme Admin',
                is_active: true
            },
            {
                id: uuidv4(),
                company_id: company2Id,
                role_id: roleCompany2Admin,
                email: 'admin@techsolutions.com',
                password_hash: passwordHash,
                name: 'Tech Solutions Admin',
                is_active: true
            }
        ];

        await User.bulkCreate(users, { ignoreDuplicates: true });
        console.log('👤 Admin users inserted');

        console.log('🎉 Seed completed successfully!');
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
}

seed();

