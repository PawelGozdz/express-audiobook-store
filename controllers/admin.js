const Audiobook = require('../models/audiobook');
const User = require('../models/user');

exports.getAddAudiobook = (req, res, next) => {
  res.render('admin/edit-audiobook', {
    pageTitle: 'Add Audiobook',
    path: '/admin/add-audiobook',
    editing: false
  });
};

exports.getUser = (req, res, next) => {
  res.render('admin/user', {
    path: '/user',
    pageTitle: 'User page',
    user: req.user
  });
};

exports.postAddAudiobook = (req, res, next) => {
  console.log(req);
  const { title } = req.body;
  const { imageUrl } = req.body;
  const { price } = req.body;
  const { description } = req.body;
  const { author } = req.body;
  const { category } = req.body;
  // createAudiobook() has been added by Sequelize when association was added in app.js. Automatically adds userId to createProduct query
  // console.log('requsrssssssssssssssssss', req.user);
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
        audiobook
      });
    })
    .catch(err => console.log(err));
};

exports.postEditAudiobook = (req, res, next) => {
  const { audiobookId } = req.body;
  const newTitle = req.body.title;
  const newPrice = req.body.price;
  const newImageUrl = req.body.imageUrl;
  const newDesc = req.body.description;
  const newAuthor = req.body.author;
  const newCategory = req.body.category;
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
