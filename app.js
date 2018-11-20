const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const sequelize = require('./util/database');
const Audiobook = require('./models/audiobook');
const User = require('./models/user');

const app = express();

app.set('view engine', 'pug');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Store user in req, so it can be used anywhere in an app
// The user from User obj from the DB, is an object with all 'sequelize' methods associated
app.use((req, res, next) => {
  User.findById(1)
    .then((user) => {
      req.user = user;
      // console.log('USER', user);
      next();
    })
    .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);

Audiobook.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Audiobook);

sequelize
  // .sync({ force: true })
  .sync()
  .then((result) => {
    return User.findById(1);
  })
  .then((user) => {
    if (!user) {
      return User.create({ name: 'Pawel', email: 'test@test.com' });
    }
    return user;
  })
  // .then(user => {
  //   // console.log(user);
  //   return user.createCart();
  // })
  .then((cart) => {
    app.listen(3000);
  })
  .catch(err => console.log(err));