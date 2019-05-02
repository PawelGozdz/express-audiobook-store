const crypto = require('crypto');
const Sequelize = require('sequelize');

const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransporter = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator/check');

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
    errorMessage: message,
    oldInput: {
      email: '',
      password: ''
    },
    validationErrors: []
  });
};

exports.postLogin = (req, res, next) => {
  const { email } = req.body;
  const { password } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('auth/login', {
      path: 'login',
      pageTitle: 'Login',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email,
        password
      },
      validationErrors: errors.array()
    });
  }

  User
    .findByPk(email)
    .then((user) => {
      if (!user) {
        // req.flash('error', 'Invalid email or password');
        return res.status(422).render('auth/login', {
          path: '/login',
          pageTitle: 'Login',
          errorMessage: 'Invalid email or password',
          oldInput: {
            email,
            password
          },
          validationErrors: []
        });
      }

      bcrypt
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
          return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: 'Invalid email or password',
            oldInput: {
              email,
              password
            },
            validationErrors: []
          });
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
    // res.render('store/index', {
    //   audiobooks: [],
    //   userBooks: [],
    //   sortNewest: [],
    //   categoryList: [],
    //   pageTitle: 'Audiobooks.pl - Online Store',
    //   path: '/'
    // });
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
    errorMessage: message,
    oldInput: {
      email: '',
      password: '',
      confirmPassword: ''
    },
    validationErrors: []
  });
};

exports.postSignup = (req, res, next) => {
  const id = (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase();
  const { email } = req.body;
  const { password } = req.body;
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('auth/signup', {
      path: 'signup',
      pageTitle: 'Signup',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email,
        password,
        confirmPassword: req.body.confirmPassword
      },
      validationErrors: errors.array()
    });
  }

  bcrypt
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
    .then((result) => {
      res.redirect('/login');
      return transporter.sendMail({
        to: email,
        from: 'Audiobooks.pl',
        subject: 'Signup successed!',
        html: `
          <p>You signed up with Audiobooks.pl!</p>
        `
      });
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
        const errors = validationResult(req);
        console.log(req.body.email);
        // res.redirect('/login');

        res.status(422).render('auth/login', {
          path: '/login',
          pageTitle: 'Login',
          errorMessage: 'You\'ve requested password change. Check your email',
          oldInput: {
            email: req.body.email,
            password: '',
            confirmPassword: ''
          },
          validationErrors: errors.array()  
        });
        // if (!errors.isEmpty()) {
        //   console.log(errors.array());
        // }

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
        passwordToken: token,
        // oldInput: {
        //   email: '',
        //   confirmPassword: ''
        // },
        // validationErrors: errors.array()
      });
    })
    .catch(error => console.log(error));
};

exports.postNewPassword = (req, res, next) => {
  const { Op } = Sequelize;
  const { password } = req.body;
  const { passwordToken } = req.body;
  let resetUser;
  const errors = validationResult(req);
  console.log(req.body.email);
  console.log('POST NEEEEEEEEW PASS', errors.array());

  if (!errors.isEmpty()) {
    console.log('EEEEEEEEErrors w POSTNEWPASSWORD', errors.array());
    res.status(422).render('auth/reset', {
      path: '/new-password',
      pageTitle: 'New-password',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: req.body.email,
        password,
        passwordToken,
        confirmPassword: req.body.confirmPassword
      },
      validationErrors: errors.array()
    }, () => res.redirect(`/reset/${passwordToken}`));
  }

  console.log('Przechodzi dalejjjjjjjjjjjjjjjj');
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
      return bcrypt.hash(password, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then((result) => {
      return res.status(422).render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: 'Your password has changed. Please use new password.',
        oldInput: {
          email: req.body.email,
          password: '',
          confirmPassword: ''
        },
        validationErrors: []
      });
    })
    .catch(err => console.log(err));
};

exports.postUpdatePassword = (req, res, next) => {
  const { password } = req.body;
  let updateUser;
  const errors = validationResult(req);

  let user = req.user;
  let audiobooks;
  let cart;
  let orders;

  const promise =  new Promise((resolve, reject) => {
    resolve();
  })

  if (!errors.isEmpty()) {
    console.log('+++++', errors.array());

    promise
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
          errorMessage: errors.array()[0].msg,
          user,
          audiobooks,
          cart,
          orders,
          oldInput: {
            password,
            confirmPassword: req.body.confirmPassword
          },
          validationErrors: errors.array()
        });
      })
    // return res.status(422).render('admin/user', {
    //   path: '/user',
    //   pageTitle: 'User settings',
    //   errorMessage: errors.array()[0].msg,
    //   user: req.user,
    //   audiobooks: [],
    //   cart: '',
    //   orders: [],
    //   oldInput: {
    //     password,
    //     confirmPassword: req.body.confirmPassword
    //   },
    //   validationErrors: errors.array()
    // });
  }

  // if (password.length === 0) {
  //   return res.redirect('/admin/user');
  // }

  User.findOne({
    where: {
      id: req.body.userId
    }
  })
    .then((user) => {
      updateUser = user;
      return bcrypt.hash(password, 12);
    })
    .then((hashedPassword) => {
      updateUser.password = hashedPassword;
      return updateUser.save();
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
        errorMessage: 'Password Updated!',
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
    // .then(() => {
    //   return res.render('admin/user', {
    //     path: '/user',
    //     pageTitle: 'User settings',
    //     errorMessage: 'Password updated!',
    //     user: req.user,
    //     audiobooks: [],
    //     cart: '',
    //     orders: [],
    //     oldInput: {
    //       password,
    //       confirmPassword: req.body.confirmPassword
    //     },
    //     validationErrors: []
    //   });
    // })
    .catch(err => console.log(err));
};

exports.postUpdateEmail = (req, res, next) => {
  const { newEmail } = req.body;
  const { confirmEmail } = req.body;
  let updateUser;

  if (newEmail.length === 0) {
    return res.redirect('/admin/user');
  }

  
  User.findOne({
    where: {
      id: req.body.userId
    }
  })
    .then((user) => {
      console.log(user.email);
      updateUser = user;

      updateUser.email = newEmail;
      console.log(updateUser);

      // console.log('****************************', updateUser);
      return updateUser.save();
    })
    .then(() => {
      res.redirect('/admin/user');
    })
    .catch(err => console.log(err));
};

// {"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"isLoggedIn":true,"user":{"id":1,"name":"Pawel","email":"test@test.com","createdAt":"2018-11-24T22:16:32.000Z","updatedAt":"2018-11-24T22:16:32.000Z"}}