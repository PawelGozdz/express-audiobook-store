const Audiobook = require('../models/audiobook');
const User = require('../models/user');
const { validationResult } = require('express-validator/check');
const { Op } = require('sequelize');

const fileHelper = require('../util/file');

exports.getAddAudiobook = (req, res, next) => {
  console.log('GET ADD AUDIOBOOK', req.body);
  res.render('admin/edit-audiobook', {
    pageTitle: 'Add Audiobook',
    path: '/admin/add-audiobook',
    editing: false,
    hasError: true,
    errorMessage: null,
    validationErrors: [],
    audiobook: {
      title: '',
      imageUrl: '',
      price: '',
      description: '',
      author: '',
      category: '',
      email: ''
    }
  });
};

exports.getUser = (req, res, next) => {
  let user = req.user;
  let audiobooks;
  let cart;
  let orders;

  const promise =  new Promise((resolve, reject) => {
    resolve();
  })
    .then(() => {
      return req.user.getAudiobooks({
        options: { email: req.user.email }
      })
    })
  // Query a list with User's audiobooks
    .then((dbAudiobooks) => {
      audiobooks = dbAudiobooks;
      // Query cart
      return req.user.getCart({ include: ['audiobooks'] })
    })
    .then((dbCart) => {
      cart = dbCart;
      return req.user.getOrders({ include: ['audiobooks'] });
    })
    .then((dbOrders) => {
      orders = dbOrders;
      
      return res.render('admin/user', {
        path: '/user',
        pageTitle: 'User dashboard',
        user,
        audiobooks,
        cart,
        orders,
        oldInput: {
          password: '',
          confirmPassword: ''
          // confirmPassword: req.body.confirmPassword
        },
        validationErrors: []
      });
    })
    .catch((error) => {
      const err = new Error('Couldn\'t find the user!. Please try again.');
      err.httpStatusCode = 500;
      // console.log('errrrrrrrrrrrr', error);
      return next(err);
    });
};

exports.postAddAudiobook = (req, res, next) => {
  const email = req.user.email || req.body.email;
  console.log("TCL: exports.postAddAudiobook -> email", email);
  // console.log('EEEEEEEEEEEEE', req);
  const { title } = req.body;
  const image = req.file;
  const { price } = req.body;
  const { description } = req.body;
  const { author } = req.body;
  const { category } = req.body;

  const errors = validationResult(req);
  // createAudiobook() has been added by Sequelize when association was added in app.js. Automatically adds userId to createProduct query

  if (!image) {
    console.log('Not an image!', image);
    
    return res.status(422).render('admin/edit-audiobook', {
      pageTitle: 'Add Audiobook',
      path: '/admin/add-audiobook',
      editing: false,
      hasError: true,
      audiobook: {
        title,
        price,
        description,
        author,
        category,
        email
      },
      errorMessage: 'Only images allowed!',
      validationErrors: []
    });
  }

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-audiobook', {
      pageTitle: 'Add Audiobook',
      path: '/admin/add-audiobook',
      editing: false,
      hasError: true,
      audiobook: {
        title,
        price,
        description,
        author,
        category,
        email
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  const imageUrl = image.path;

  req.user.createAudiobook({
    title,
    price,
    imageUrl,
    description,
    author,
    category
    // userId: req.user.id  
  })
    .then((results) => {
      // console.log('resssssssssssssssssss', results);
      res.redirect('/admin/audiobooks');
    })
    .catch((err) => {
      const error = new Error('Something went wrong and couldn\'t save it. Please try again.');
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditAudiobook = (req, res, next) => {
  console.log('GET EDIT AUDIOBOOK', req.body);
  const editMode = JSON.parse(req.query.edit);
  if (!editMode) {
    return res.redirect('/');
  }
  const { audiobookId } = req.params;
  req.user.getAudiobooks({ where: { id: audiobookId } })
  // Audiobook.findById(audiobookId)
    .then((audiobooks) => {
      const audiobook = audiobooks[0];
      if (!audiobook) {
        return res.redirect('/');
      }
      res.render('admin/edit-audiobook', {
        pageTitle: 'Edit Audiobook',
        path: '/admin/edit-audiobook',
        editing: editMode,
        audiobook,
        hasError: false,
        errorMessage: null,
        validationErrors: []
      });
    })
    .catch((err) => {
      const error = new Error('Something went wrong! Couldn\'t load audiobooks.');
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditAudiobook = (req, res, next) => {
  console.log('POST EDIT AUDIOBOOK', req.body);
  const { audiobookId } = req.body;
  const newTitle = req.body.title;
  const newPrice = req.body.price;
  const image = req.file;
  const newDesc = req.body.description;
  const newAuthor = req.body.author;
  const newCategory = req.body.category;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-audiobook', {
      pageTitle: 'Edit audiobook',
      path: '/admin/edit-audiobook',
      editing: true,
      hasError: true,
      audiobook: {
        title: newTitle,
        price: newPrice,
        description: newDesc,
        author: newAuthor,
        category: newCategory,
        id: audiobookId
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  Audiobook.findById(audiobookId)
    .then((audiobook) => {
      if (audiobook.userEmail.toString() !== req.user.email.toString()) {
        return res.redirect('/');
      }
      audiobook.title = newTitle;
      audiobook.description = newDesc;
      audiobook.price = newPrice;
      audiobook.author = newAuthor;
      audiobook.category = newCategory;
      audiobook.id = audiobookId;
      if (image) {
        fileHelper.deleteFile(audiobook.imageUrl);
        audiobook.imageUrl = image.path;
      }

      return audiobook
        .save()
        .then((result) => {
          console.log('PRODUCT HAS BEEN UPDATED!');
          res.redirect('/admin/audiobooks');
        })
    })
    .catch((err) => {
      const error = new Error('Couldn\'t save your changes. Please try again');
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getAudiobooks = (req, res, next) => {
  req.user.getAudiobooks({
    options: { email: req.user.email }
  })
  // req.user.getAudiobooks()
  // Audiobook.findAll()
    .then((audiobooks) => {
      res.render('admin/audiobooks', {
        audiobooks,
        pageTitle: 'Admin Audiobooks',
        path: '/admin/audiobooks'
      });
    })
    .catch(err => console.log(err));
};

exports.postDeleteAudiobook = (req, res, next) => {
  const { audiobookId } = req.body;
  Audiobook
    .findById(audiobookId)
    .then(audiobook => audiobook.destroy())
    .then((result) => {
      console.log('PRODUCT DESTROYED');
      res.redirect('/admin/audiobooks');
    })
    .catch(err => console.log(err));
};
