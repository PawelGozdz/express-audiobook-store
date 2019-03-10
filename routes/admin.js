const path = require('path');

const express = require('express');

const adminController = require('../controllers/admin');
const isAuth = require('../middlewear/isAuth');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-audiobook', isAuth, adminController.getAddAudiobook);

router.get('/user', isAuth, adminController.getUser);

// /admin/products => GET
router.get('/audiobooks', isAuth, adminController.getAudiobooks);

// /admin/add-product => POST
router.post('/add-audiobook', isAuth, adminController.postAddAudiobook);

router.get('/edit-audiobook/:audiobookId', isAuth, adminController.getEditAudiobook);

router.post('/edit-audiobook', isAuth, adminController.postEditAudiobook);

router.post('/delete-audiobook', isAuth, adminController.postDeleteAudiobook);

module.exports = router;
