const express = require('express');

const authValidation = require('../validation/auth-validation');
const authController = require('../controllers/auth-controller');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login', authValidation.validateLogin(), authController.postLogin);

router.post('/signup', authValidation.validateSignup(), authController.postSignup);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;