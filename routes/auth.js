const express = require('express');
const { check, body } = require('express-validator/check');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login', [
  body('email').isEmail()
    .withMessage('Please enter valid email')
    .normalizeEmail(),
  body('password', 'Incorrect password! It must be at least 5 characters.')
    .isAlphanumeric()
    .isLength({ min: 5, max: 20 })
    .trim()
], authController.postLogin);

router.post('/signup', [
  check('email').isEmail().trim()
    .withMessage('Invalid email')
    .normalizeEmail()
    .custom((val, { req }) => {
      return User.findByPk(val)
        .then((user) => {
          // console.log('ssssssssssssssssssss', user);
          if (user) {
            // return Promise.reject('This email already exists. Choose another one!');
            throw new Error('This email already exists. Choose another one!');
          }
        });
    }),
  body('password', 'Incorrect password! It must be at least 5 characters.')
    .isAlphanumeric()
    .isLength({ min: 5, max: 20 })
    .trim(),
  body('confirmPassword')
    // .isLength({ min: 5, max: 20 })
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords don\'t match!');
      }
      return true;
    })
], authController.postSignup);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', [
  body('password', 'Incorrect password! It must be at least 5 characters.')
    .isAlphanumeric()
    .isLength({ min: 5, max: 20 })
    .trim(),
  body('confirmPassword')
    // .isLength({ min: 5, max: 20 })
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords don\'t match!');
      }
      return true;
    })
],authController.postNewPassword);

router.post('/updatepassword', [
  body('password', 'Incorrect password! It must be at least 5 characters.')
    .isAlphanumeric()
    .isLength({ min: 5, max: 20 })
    .trim(),
  body('confirmPassword')
    // .isLength({ min: 5, max: 20 })
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords don\'t match!');
      }
      return true;
    })
],authController.postUpdatePassword);

router.post('/updateemail', authController.postUpdateEmail);

module.exports = router;
