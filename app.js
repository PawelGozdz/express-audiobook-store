const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const csrf = require('csurf');
const flash = require('connect-flash');
// const Sequelize = require('sequelize');

// const sequelize = new Sequelize('audiobook-store', 'root', 'Wyczeswow1', {
//   dialect: 'mysql', host: 'localhost'
// });
const SequelizeStore = require('connect-session-sequelize')(session.Store);
//  console.log(sequelize);

// console.log(SequelizeStore);

const sequelize = require('./util/database');
const Audiobook = require('./models/audiobook');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');
// const Session = require('./util/Session');

const app = express();
const store = new SequelizeStore({
  db: sequelize
});
const csrfProtection = csrf();

app.set('view engine', 'pug');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const storeRoutes = require('./routes/store');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'my-secret',
  resave: false,
  saveUninitialized: false,
  store,
  proxy: true
  // checkExpirationInterval: 15 * 60 * 1000,
  // expiration: 24 * 60 * 60 * 1000
}));
app.use(csrfProtection);
app.use(flash());

// store.sync();

// Store user in req, so it can be used anywhere in an app
// The user from User obj from the DB, is an object with all 'sequelize' methods associated
app.use((req, res, next) => {
  // console.log('SESSION USER', req.session.user);
  if (!req.session.user) {
    // console.log('NEEEEEEEEEEEEEEEEET', req.session);

    return next();
  }
  User.findByPk(req.session.user.email)
    .then((user) => {
      req.user = user;
      // console.log(req.user);
      next();
    })
    .catch(err => console.log(err));
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use('/admin', adminRoutes);
app.use(storeRoutes);
app.use(authRoutes);

Audiobook.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Audiobook);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Audiobook, { through: CartItem });
Audiobook.belongsToMany(Cart, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Audiobook, { through: OrderItem });
Audiobook.belongsToMany(Order, { through: OrderItem });

sequelize
  // .sync({ force: true })
  .sync()
  // .then(result => User.findById(1))
  // .then((user) => {
  //   if (!user) {
  //     return User.create({ name: 'Pawel', email: 'test@test.com' });
  //   }
  //   return user;
  // })
  // .then(user => user.createCart())
  .then((cart) => {
    app.listen(3000);
  })
  .catch(err => console.log(err));
