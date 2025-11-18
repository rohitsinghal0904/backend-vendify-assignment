const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'vendify_erp',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: true
    }
  }
);
sequelize.authenticate()
  .then(() => {
    if (process.env.NODE_ENV !== 'test') {
      console.log('Database connection established successfully.');
    }
  })
  .catch(err => {
    if (process.env.NODE_ENV !== 'test') {
      console.warn('⚠️  Database connection warning:', err.message);
      console.warn('💡 Run "npm run setup" to create the database');
    }
  });

module.exports = sequelize;

