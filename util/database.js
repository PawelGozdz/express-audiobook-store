const Sequelize = require('sequelize');
const db = require('./secret');

const sequelize = new Sequelize({
  db,
  user: db.user,
  password: db.password,
  options: {
    dialect: 'mysql', host: 'localhost', logging: false
  }
});

// const sequelize = new Sequelize(
//   `postgres://${process.env.SQL_USER}:${process.env.SQL_PASSWORD}@ec2-54-247-85-251.eu-west-1.compute.amazonaws.com:5432/${process.env.SQL_DB_DEFAULT}`);


// const sequelize = new Sequelize(
//   'dckgl3ud0lshou', // db name
//   'yhznlayubjijhl', // db user ('root')
//   '07e34db9932adea52760463199346c31ebeea205f6d064a2f3c7f38b1fa5cf43', {
//   dialect: 'postgres', host: 'ec2-54-247-85-251.eu-west-1.compute.amazonaws.com', logging: false
// });

// const sequelize = new Sequelize('postgres://yhznlayubjijhl:07e34db9932adea52760463199346c31ebeea205f6d064a2f3c7f38b1fa5cf43@ec2-54-247-85-251.eu-west-1.compute.amazonaws.com:5432/dckgl3ud0lshou');

module.exports = sequelize;


// const pool = mysql.createPool({
//   host: 'localhost',
//   user: 'root',
//   database: 'db',
//   password: 'password'
// });

