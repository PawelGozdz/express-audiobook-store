const Audiobook = require('../models/audiobook');

exports.getAddAudiobook = (req, res, next) => {
  res.render('admin/edit-audiobook', {
    pageTitle: 'Add Audiobook',
    path: '/admin/add-audiobook',
    editing: false
  });
};

exports.postAddAudiobook = (req, res, next) => {
  const { title } = req.body;
  const { imageUrl } = req.body;
  const { price } = req.body;
  const { description } = req.body;
  const { author } = req.body;
  // createAudiobook() has been added by Sequelize when association was added in app.js. Automatically adds userId to createProduct query
  req.user.createAudiobook({
    title,
    price,
    imageUrl,
    description,
    author
    // userId: req.user.id
  })
    .then((results) => {
      res.redirect('/admin/audiobooks');
    })
    .catch(err => console.log(err));
};

exports.getAudiobooks = (req, res, next) => {
  req.user.getAudiobooks()
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
  const audioId = req.body.audiobookId;
  console.log(audioId);
  Audiobook.findById(audioId)
    .then(audiobook => audiobook.destroy())
    .then((result) => {
      console.log('PRODUCT DESTROYED');
      res.redirect('/admin/audiobooks');
    })
    .catch(err => console.log(err));
};
