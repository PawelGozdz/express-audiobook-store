const Sequelize = require('sequelize');
const db = require('./secret');

const sequelize = new Sequelize(
  db.secret.db, // db name
  db.secret.user, // db user ('root')
  db.secret.password, {
  dialect: 'mysql', host: 'localhost', logging: false
});

module.exports = sequelize;


// const pool = mysql.createPool({
//   host: 'localhost',
//   user: 'root',
//   database: 'db',
//   password: 'password'
// });

