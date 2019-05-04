const Sequelize = require('sequelize');
const db = require('./secret');

const sequelize = new Sequelize(
  'h0q380ktlub6hy1f', // db name
  'd31tg3kvprb38tll', // db user ('root')
  'p171aizbptovvct8', {
  dialect: 'mysql', host: 'ivgz2rnl5rh7sphb.chr7pe7iynqr.eu-west-1.rds.amazonaws.com', logging: false
});

module.exports = sequelize;


// const pool = mysql.createPool({
//   host: 'localhost',
//   user: 'root',
//   database: 'db',
//   password: 'password'
// });

