const User = require('../models/user');

// Zobaczyć, czy instnieje metoda .destroy() w obiekcie session

exports.getLogin = (req, res, next) => {
  console.log(req.get('Cookie'));
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: false
  });
};

exports.postLogin = (req, res, next) => {
  User.findById(1)
    .then((user) => {
      // console.log('USER', user);
      req.session.isLoggedIn = true;
      req.session.user = user;
      req.session.save(() => {
        res.redirect('/');
      });
      // console.log(req.session);
    })
    .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
  // console.log('REQ.SESSION', req.session.destroy);
  req.session.destroy((err) => {
    // console.log('USERRRRRRRRRRRR');
    // console.log(err);
    // res.redirect('/');
    res.redirect('/');
  });
};


// {"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"isLoggedIn":true,"user":{"id":1,"name":"Pawel","email":"test@test.com","createdAt":"2018-11-24T22:16:32.000Z","updatedAt":"2018-11-24T22:16:32.000Z"}}