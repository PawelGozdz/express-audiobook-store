const path = require('path');

const express = require('express');
const { body } = require('express-validator/check');

const adminController = require('../controllers/admin');
const isAuth = require('../middlewear/isAuth');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-audiobook', isAuth, adminController.getAddAudiobook);

router.get('/user', isAuth, adminController.getUser);

// /admin/products => GET
router.get('/audiobooks', isAuth, adminController.getAudiobooks);

// /admin/add-product => POST
router.post('/add-audiobook', [
  body('title')
    .isString()
    .isLength({ min: 2 })
    .trim(),
  body('author')
    .isString()
    .isLength({ min: 4 })
    .trim(),
  body('category')
    .isString()
    .isLength({ min: 2 })
    .trim(),
  body('price').isFloat(),
  body('description')
    .isString()
    .isLength({ min: 4, max: 80 })
    .trim()
], isAuth, adminController.postAddAudiobook);

router.get('/edit-audiobook/:audiobookId', isAuth, adminController.getEditAudiobook);

router.post('/edit-audiobook', [
  body('title')
    .isString()
    .isLength({ min: 2 })
    .trim(),
  body('author')
    .isString()
    .isLength({ min: 4 })
    .trim(),
  body('category')
    .isString()
    .isLength({ min: 2 })
    .trim(),
  body('price').isFloat(),
  body('description')
    .isString()
    .isLength({ min: 4, max: 80 })
    .trim()  
], isAuth, adminController.postEditAudiobook);

router.post('/delete-audiobook', isAuth, adminController.postDeleteAudiobook);

module.exports = router;
