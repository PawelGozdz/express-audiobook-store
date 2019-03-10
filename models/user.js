const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const User = sequelize.define('user', {
  id: {
    type: Sequelize.STRING
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true
  },
  password: Sequelize.STRING,
  resetToken: Sequelize.STRING,
  resetTokenExpiration: Sequelize.DATE
});

module.exports = User;
