const path = require('path');
const fs = require('fs-extra');

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');
const fileHelper = require('./util/file');

const sequelize = require('./util/database');
const Audiobook = require('./models/audiobook');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');

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
const errorController = require('./controllers/error');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  multer({ storage: fileHelper.storage, fileFilter: fileHelper.fileFilter }).single('image')
);

app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
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

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

// store.sync();

// Store user in req, so it can be used anywhere in an app
// The user from User obj from the DB, is an object with all 'sequelize' methods associated
app.use((req, res, next) => {
  // console.log('SESSION USER', req.session.user);
  if (!req.session.user) {
    return next();
  }
  User.findByPk(req.session.user.email)
    .then((user) => {
      if (!user) return next();
      req.user = user;
      next();
    })
    .catch((err) => {
      next(new Error(err));
    });
});

app.use('/admin', adminRoutes);
app.use(storeRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500);
app.use(errorController.get404);

app.use((error, req, res, next) => {
  // console.log('MIDDLEWEAR error', error);
  res.status(500).render('500', {
    pageTitle: 'Error!',
    path: '/500',
    isAuthenticated: req.session.isLoggedIn,
    csrfToken: ''
  });
});


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

  .then((cart) => {
    app.listen(3000);
  })
  .catch(err => console.log(err));
