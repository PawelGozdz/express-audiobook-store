const Audiobook = require('../models/audiobook');
const OrderItem = require('../models/order-item');

exports.getYourLibrary = (req, res, next) => {
  let audiobooks;

  req.user.getAudiobooks()
    .then((dbAudiobooks) => {
      if (!dbAudiobooks) {
        dbAudiobooks = [];
      }

      audiobooks = dbAudiobooks;

      return req.user.getOrders({ include: ['audiobooks'] });
    })
    .then((orders) => {
      if (!orders) return;

      const tempArr2 = [];

      orders
        .map(order => tempArr2.push(...order.audiobooks));

      return tempArr2;
    })
    .then((uniqueBooks) => {
      if (!uniqueBooks) {
        uniqueBooks = [];
      }

      return res.render('store/audiobook-list', {
        audiobooks,
        purchased: uniqueBooks,
        pageTitle: 'Your Library',
        path: '/your-library'
      });
    })
    .catch(err => new Error('Can\'t load Your Library', err));
};

exports.getAudiobook = (req, res, next) => {
  const { audiobookId } = req.params;
  let audiobook;

  Audiobook
    .findById(audiobookId)
    .then((dbAudiobook) => {

      audiobook = dbAudiobook;

      if (!req.user) {
        audiobook.bookOwner = false;
        return;
      }

      audiobook.bookOwner = dbAudiobook.userEmail === req.user.email ? true : false;
      
      return req.user.getOrders({ include: ['audiobooks'] });
    })
    .then((userPurchasedBooks) => {

      if (!userPurchasedBooks) {
        userPurchasedBooks = [];
        return userPurchasedBooks;
      }

      const tempArr2 = [];
      userPurchasedBooks
        .map(order => tempArr2.push(...order.audiobooks));

      return tempArr2;
    })
    .then((purchasedBooks) => {

      if (!purchasedBooks) {
        purchasedBooks = [];
      }

      purchasedBooks.map((ab) => {
        if (ab.id.toString() === audiobookId.toString()) {
          audiobook.bookOwner = true;
        }
        return audiobook;
      });

      return res.render('store/audiobook-detail', {
        audiobook,
        pageTitle: audiobook.title,
        path: '/audiobooks'
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getIndex = (req, res, next) => {
  let audiobooks;
  let sortNewest;
  const categoryList = [];
  const categoryCounter = {};

  Audiobook
    .findAll({ options: { limit: 2 } })
    .then((dbAudiobooks) => {
      if (!dbAudiobooks) {
        audiobooks = [];
        return audiobooks;
      }
      audiobooks = dbAudiobooks;
      audiobooks.map(audiobook => audiobook.bookOwner = req.user && req.user.email === audiobook.userEmail ? true : false);

      sortNewest = audiobooks.map(el => el)
        .sort((a, b) => a.createdAt < b.createdAt)
        .filter((el, i) => i < 6);

      // audiobooks.forEach((ab) => {
      //   categoryCounter[ab.category] = (categoryCounter[ab.category] || 0) + 1;
      // });

      // for (ab in categoryCounter) {
      //   if (ab) categoryList.push([ab, categoryCounter[ab]]);
      // }

      // categoryList.sort((a, b) => a > b);
      audiobooks = audiobooks.filter((el, i) => i < 4);

      if (!req.user) return;

      return req.user.getOrders({ include: ['audiobooks'] });
    })
    .then((userPurchasedBooks) => {
      if (!userPurchasedBooks) {
        userPurchasedBooks = [];
        return userPurchasedBooks;
      }

      const tempArr2 = [];

      userPurchasedBooks
        .map(order => tempArr2.push(...order.audiobooks));

      return tempArr2;
    })
    .then((purchasedBooks) => {
      if (!purchasedBooks) {
        purchasedBooks = [];
      }

      audiobooks.map((audiobook) => {
        purchasedBooks.map((ab) => {
          if (audiobook.id.toString() === ab.id.toString()) {
            audiobook.bookOwner = true;
            return audiobook;
          }
        });
      });

      res.render('store/index', {
        audiobooks,
        userBooks: purchasedBooks,
        sortNewest,
        // categoryList,
        pageTitle: 'Audiobooks.pl - Online Store',
        path: '/'
      });
    })
    .catch(err => new Error('Can\'t load index page', err));
};

exports.getCart = (req, res, next) => {
  req.user
    .getCart()
    .then((cart) => {
      return cart
        .getAudiobooks()
        .then((audiobooks) => {
          res.render('store/cart', {
            path: '/cart',
            pageTitle: 'Your Cart',
            audiobooks
          });
        });
    })
    .catch(err => new Error('Can\'t load the cart', err));
};

exports.postCart = (req, res, next) => {
  const { audiobookId } = req.body;
  let fetchedCart;
  let newQty = 1;

  req.user
    .getCart()
    .then((cart) => {
      fetchedCart = cart;
      return cart.getAudiobooks({ where: { id: audiobookId } });
    })
    .then((audiobooks) => {
      const audiobook = audiobooks.length > 0 ? audiobooks[0] : '';

      if (audiobook) {
        const odlQuantity = audiobook.cartItem.quantity;
        newQty = odlQuantity + 1;
        return audiobook;
      }

      return Audiobook.findById(audiobookId);
    })
    .then(audiobook => fetchedCart.addAudiobook(audiobook, { through: { quantity: newQty } }))
    .then(() => res.redirect('/cart'))
    .catch(err => new Error('Can\'t post the cart', err));
};

exports.postCartDeleteAudiobook = (req, res, next) => {
  const { audiobookId } = req.body;
  req.user
    .getCart()
    .then(cart => cart.getAudiobooks({ where: { id: audiobookId } }))
    .then(audiobooks => audiobooks[0].cartItem.destroy())
    .then(cart => res.redirect('/cart'))
    .catch(err => new Error('Can\'t delete your cart', err));
};

exports.postOrder = (req, res, next) => {
  let fetchedCart;
  let audiobooks;
  req.user
    .getCart()
    .then((cart) => {
      fetchedCart = cart;
      return cart.getAudiobooks();
    })
    .then((audiobks) => {
      audiobooks = audiobks;
      return req.user.createOrder();
    })
    .then((order) => {
      return order.addAudiobooks(audiobooks.map((audiobook) => {
        // Name must be the same as the 'order-item' model
        audiobook.orderItem = { quantity: audiobook.cartItem.quantity };
        return audiobook;
      }));
    })
    .then(result => fetchedCart.setAudiobooks(null))
    .then(result => res.redirect('/orders'))
    .catch(err => new Error('Can\'t post the order', err));
};

exports.getOrders = (req, res, next) => {
  req.user
    .getOrders({ include: ['audiobooks'] })
    .then((orders) => {
      res.render('store/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders
      });
    })
    .catch(err => new Error(('Can\'t load the orders', err)));
};
