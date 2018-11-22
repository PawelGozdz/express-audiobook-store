const Audiobook = require('../models/audiobook');

exports.getAudiobooks = (req, res, next) => {
  Audiobook.findAll()
    .then((audiobooks) => {
      res.render('store/audiobook-list', {
        audiobooks,
        pageTitle: 'Check Our Audiobooks',
        path: '/audiobooks'
      });
    })
    .catch(err => console.log(err));
};

exports.getAudiobook = (req, res, next) => {
  const { audiobookId } = req.params;
  Audiobook.findById(audiobookId)
    .then((audiobook) => {
      res.render('store/audiobook-detail', {
        audiobook,
        pageTitle: audiobook.title,
        path: '/audiobooks'
      });
    })
    .catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
  Audiobook.findAll()
    .then((audiobooks) => {
      const sortNewest = audiobooks.map(el => el)
        .sort((a, b) => a.createdAt < b.createdAt)
        .filter((el, i) => i < 6);
      audiobooks = audiobooks.filter((el, i) => i < 4);
      res.render('store/index', {
        audiobooks,
        sortNewest,
        pageTitle: 'Audiobooks.pl - Online Store',
        path: '/'
      });
    })
    .catch(err => console.log(err));
};

exports.getCart = (req, res, next) => {
  req.user.getCart()
    .then((cart) => {
      return cart
        .getAudiobooks()
        .then((audiobooks) => {
          res.render('store/cart', {
            path: '/cart',
            pageTitle: 'Your Cart',
            audiobooks
          });
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
};

exports.postCart = (req, res, next) => {
  const { audiobookId } = req.body;
  let fetchedCart;
  let newQty = 1;
  req.user.getCart()
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
    .then((audiobook) => {  
      return fetchedCart.addAudiobook(audiobook, {
        through: { quantity: newQty }
      });
    })
    .then(() => {
      res.redirect('/cart');
    })
    .catch(err => console.log(err));
};

exports.postCartDeleteAudiobook = (req, res, next) => {
  const { audiobookId } = req.body;
  req.user.getCart()
    .then((cart) => {
      return cart.getAudiobooks({ where: { id: audiobookId } });
    })
    .then((audiobooks) => {
      const audiobook = audiobooks[0];
      return audiobook.cartItem.destroy();
    })
    .then(cart => res.redirect('/cart'))
    .catch(err => console.log(err));
};
