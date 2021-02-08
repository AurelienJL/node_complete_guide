const express = require('express');
const router = express.Router();

const adminController = require('../controllers/admin-controller');
const isAuth = require('../middleware/is-auth');

router.get('/add-product', isAuth, adminController.getAddProduct);

router.post('/add-product', isAuth, adminController.postAddProduct);

router.post('/edit-product', isAuth, adminController.postEditProduct);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post('/delete-product', isAuth, adminController.deleteProduct);

router.get('/products', isAuth, adminController.getProducts);

module.exports = router;