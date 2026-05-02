const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/empay', {
  dialect: 'postgres',
  logging: false,
  define: {
    timestamps: true,
    underscored: true,
  },
});

module.exports = sequelize;
