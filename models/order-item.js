const Sequelize = require('sequelize');

const sequelize = require('../util/database');

// orderItem will be used later on in postOrder route. It has to be the same to make sure, that sequelize understands what is what
const OrderItem = sequelize.define('orderItem', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  quantity: Sequelize.INTEGER
});

module.exports = OrderItem;
