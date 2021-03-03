const { body } = require('express-validator/check');

exports.validateProduct = () => [
    body('title')
        .isLength({ min: 1 })
        .isString()
        .withMessage("Title is required")
        .trim(),
    body('imageUrl')
        .isURL()
        .withMessage("Url is incorrect"),
    body('price')
        .isFloat()
        .withMessage("Price is required"),
    body('description')
        .isLength({ min: 5, max: 100 })
        .trim()
        .withMessage("Description is required")
];