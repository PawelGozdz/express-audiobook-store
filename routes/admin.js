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

// router.get('/edit-product/:productId', adminController.getEditAudiobook);

// router.post('/edit-product', adminController.postEditProduct);

router.post('/delete-product', adminController.postDeleteAudiobook);

module.exports = router;
