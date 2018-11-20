const path = require('path');

const express = require('express');

const adminController = require('../controllers/admin');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-audiobook', adminController.getAddAudiobook);

// /admin/products => GET
router.get('/audiobooks', adminController.getAudiobooks);

// /admin/add-product => POST
router.post('/add-audiobook', adminController.postAddAudiobook);

router.get('/edit-audiobook/:audiobookId', adminController.getEditAudiobook);

router.post('/edit-audiobook', adminController.postEditAudiobook);

router.post('/delete-audiobook', adminController.postDeleteAudiobook);

module.exports = router;
