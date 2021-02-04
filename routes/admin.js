const express = require('express');
const router = express.Router();

const adminController = require('../controllers/admin-controller');

router.get('/add-product', adminController.getAddProduct);

router.post('/add-product', adminController.postAddProduct);

router.post('/edit-product', adminController.postEditProduct);

router.get('/edit-product/:productId', adminController.getEditProduct);

router.post('/delete-product', adminController.deleteProduct);

router.get('/products', adminController.getProducts);

module.exports = router;