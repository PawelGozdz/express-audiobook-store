const crypto = require('crypto');
const Sequelize = require('sequelize');

const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransporter = require('nodemailer-sendgrid-transport');
const User = require('../models/user');

const transporter = nodemailer.createTransport(sendgridTransporter({
  auth: {
    api_key: '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'
  }
}));

exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  // console.log('MMMMMMMMMMMMMMMM', message);
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message
  });
};

exports.postLogin = (req, res, next) => {
  const { email } = req.body;
  const { password } = req.body;
  User
    .findByPk(email)
    .then((user) => {
      if (!user) {
        req.flash('error', 'Invalid password');
        return res.redirect('/login');
      }

      return bcrypt
        .compare(password, user.password)
        .then((match) => {
          if (match) {
            // console.log('MATCH HASLOddd', match);
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(() => {
              res.redirect('/');
            });
          }
          req.flash('error', 'Invalid email or password');
          res.redirect('/login');
        });
    })
    // .then(result => console.log(result))
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

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message
  });
};

exports.postSignup = (req, res, next) => {
  const id = (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase();
  const { email } = req.body;
  const { password } = req.body;
  const { confirmPassword } = req.body;
  // console.log();
  User
    .findByPk(email)
    .then((userDB) => {
      if (userDB) {
        req.flash('error', 'This user exists already! Log in or try another email address.');
        return res.redirect('/login');
      }
      return bcrypt
        .hash(password, 12)
        .then((hashPassword) => {
          const user = new User({
            email,
            password: hashPassword,
            id
          });
          user.save();
          return user.createCart();
        })
        .then(result => res.redirect('/login'))
    })
    .catch(err => console.log(err));
};

exports.getReset = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: message
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    User
      .findByPk(req.body.email)
      .then((user) => {
        if (!user) {
          req.flash('error', 'No account with that email found');
          return res.redirect('/reset');
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then((result) => {
        console.log(req.body.email);
        res.redirect('/login');
        transporter.sendMail({
          to: req.body.email,
          from: 'Audiobooks',
          subject: 'Password Reset',
          html: `
            <h3>Password Reset</h3>
            <p>You have requested a password change. Please click the link below to proceed.</p>
            <a href="http://localhost:3000/reset/${token}">LINK</a>
          `
        });
      })
      .catch(error => console.log(error));
  });
};

exports.getNewPassword = (req, res, next) => {
  const { Op } = Sequelize;
  const { token } = req.params;
  User
    .findOne({
      where: {
        resetToken: token,
        resetTokenExpiration: {
          [Op.gt]: Date.now()
        }
      }
    })
    .then((user) => {
      console.log('USERRRRRRRRRRRRRRR', user);
      let message = req.flash('error');
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'New Password',
        errorMessage: message,
        userId: user.id,
        email: user.email,
        passwordToken: token
      });
    })
    .catch(error => console.log(error));
};

exports.postNewPassword = (req, res, next) => {
  const { Op } = Sequelize;
  const newPassword = req.body.password;
  const { passwordToken } = req.body;
  let resetUser;

  console.log('UUUUUUUUUUUWWWWW', req.user);
  User
    .findOne({
      where: {
        resetToken: passwordToken,
        resetTokenExpiration: {
          [Op.gt]: Date.now()
        },
        id: req.body.userId
      }
    })
    .then((user) => {
      console.log('UUUUUUUUUUU', user);
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then(result => res.redirect('/login'))
    .catch(err => console.log(err));
};
// .then(user => user.createCart())

// {"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"isLoggedIn":true,"user":{"id":1,"name":"Pawel","email":"test@test.com","createdAt":"2018-11-24T22:16:32.000Z","updatedAt":"2018-11-24T22:16:32.000Z"}}