// Initialize all Sequelize models and associations
const sequelize = require('../config/sequelize');

// Import models
const Company = require('./sequelize/Company');
const Role = require('./sequelize/Role');
const User = require('./sequelize/User');
const AuditLog = require('./sequelize/AuditLog');
const RefreshToken = require('./sequelize/RefreshToken');

// Define associations after all models are loaded
Role.belongsTo(Company, { foreignKey: 'company_id' });
User.belongsTo(Company, { foreignKey: 'company_id' });
User.belongsTo(Role, { foreignKey: 'role_id' });
User.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
AuditLog.belongsTo(Company, { foreignKey: 'company_id' });
AuditLog.belongsTo(User, { foreignKey: 'user_id' });
RefreshToken.belongsTo(User, { foreignKey: 'user_id' });

module.exports = {
  sequelize,
  Company,
  Role,
  User,
  AuditLog,
  RefreshToken
};

