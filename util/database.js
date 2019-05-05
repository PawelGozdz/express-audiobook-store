const Sequelize = require('sequelize');

const sequelize = new Sequelize({
  username: process.env.DB_USERNAME,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOSTNAME,
  port: 5432,
  ssl: true,
  dialect: 'postgres',
  dialectOptions: {
    'ssl': { 'require': true }
  },
  logging: false
});

module.exports = sequelize;
