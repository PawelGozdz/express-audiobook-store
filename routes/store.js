const path = require('path');

const express = require('express');

const storeController = require('../controllers/store');

const router = express.Router();

router.get('/', storeController.getIndex);

router.get('/audiobooks', storeController.getAudiobooks);

router.get('/audiobooks/:audiobookId', storeController.getAudiobook);

router.get('/cart', storeController.getCart);

router.post('/cart', storeController.postCart);

router.post('/cart-delete-item', storeController.postCartDeleteAudiobook);

router.post('/create-order', storeController.postOrder);

router.get('/orders', storeController.getOrders);

module.exports = router;
