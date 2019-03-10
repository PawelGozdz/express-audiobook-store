const path = require('path');

const express = require('express');

const storeController = require('../controllers/store');
const isAuth = require('../middlewear/isAuth');

const router = express.Router();

router.get('/', storeController.getIndex);

router.get('/audiobooks', storeController.getAudiobooks);

router.get('/audiobooks/:audiobookId', storeController.getAudiobook);

router.get('/cart', isAuth, storeController.getCart);

router.post('/cart', isAuth, storeController.postCart);

router.post('/cart-delete-item', isAuth, storeController.postCartDeleteAudiobook);

router.post('/create-order', isAuth, storeController.postOrder);

router.get('/orders', isAuth, storeController.getOrders);

module.exports = router;
