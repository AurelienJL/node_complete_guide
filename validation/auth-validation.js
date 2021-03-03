const { check, body } = require('express-validator/check');
const User = require('../models/user');

exports.validateLogin = () => [
    check('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .normalizeEmail(),
    body('password', 'Invalid email or password')
        .isLength({ min: 5 })
        .isAlphanumeric()
        .trim()
];

exports.validateSignup = () => [
    check('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .custom((value, { req }) => {
            return User.findOne({ email: value })
                .then(u => {
                    if (u) {
                        // async validation
                        return Promise.reject('e-mail exists already, please pick a different one !');
                    }
                });
        })
        .normalizeEmail(),
    body('password', 'Please enter a 5 characters long with numbers and letters only')
        .isLength({ min: 5 })
        .isAlphanumeric()
        .trim(),
    body('confirmPassword').trim()
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords don\'t match');
            }
            return true;
        })
];
