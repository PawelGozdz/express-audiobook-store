const Audiobook = require('../models/audiobook');
const User = require('../models/user');
const { validationResult } = require('express-validator/check');

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
  // const errors = validationResult(req);
  res.render('admin/user', {
    path: '/user',
    pageTitle: 'User page',
    user: req.user,
    oldInput: {
      password: '',
      confirmPassword: ''
      // confirmPassword: req.body.confirmPassword
    },
    validationErrors: []
  });
};

exports.postAddAudiobook = (req, res, next) => {
  console.log('POST ADD AUDIOBOOK', req.body);
  const email = req.user.email || req.body.email;
	console.log("TCL: exports.postAddAudiobook -> email", email)
  const { title } = req.body;
  const { imageUrl } = req.body;
  const { price } = req.body;
  const { description } = req.body;
  const { author } = req.body;
  const { category } = req.body;
  const errors = validationResult(req);
  // createAudiobook() has been added by Sequelize when association was added in app.js. Automatically adds userId to createProduct query
  // console.log('requsrssssssssssssssssss', req.user);

  console.log('eeeeeeeee', description);
  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-audiobook', {
      pageTitle: 'Add Audiobook',
      path: '/admin/add-audiobook',
      editing: false,
      hasError: true,
      audiobook: {
        title,
        imageUrl,
        price,
        description,
        author,
        category,
        email
      },
      errorMessage: errors.array()[0].msg,
      // errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
      // isAuthenticated: req.session.isLoggedIn
    });
  }

  console.log('LOOOOOOOOOOOG', title);

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
    .catch(err => console.log(err));
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
    .catch(err => console.log(err));
};

exports.postEditAudiobook = (req, res, next) => {
  console.log('POST EDIT AUDIOBOOK', req.body);
  const { audiobookId } = req.body;
  const newTitle = req.body.title;
  const newPrice = req.body.price;
  const newImageUrl = req.body.imageUrl;
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
        imageUrl: newImageUrl,
        price: newPrice,
        description: newDesc,
        author: newAuthor,
        category: newCategory,
        id: audiobookId
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
      // isAuthenticated: req.session.isLoggedIn
    });
  }

  Audiobook.findById(audiobookId)
    .then((audiobook) => {
      if (audiobook.userEmail.toString() !== req.user.email.toString()) {
        return res.redirect('/');
      }
      audiobook.title = newTitle;
      audiobook.imageUrl = newImageUrl;
      audiobook.description = newDesc;
      audiobook.price = newPrice;
      audiobook.author = newAuthor;
      audiobook.category = newCategory;
      audiobook.id = audiobookId;
      return audiobook
        .save()
        .then((result) => {
          console.log('PRODUCT HAS BEEN UPDATED!');
          res.redirect('/admin/audiobooks');
        })
    })
    .catch(err => console.log(err));
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
