
const Product = require('../models/product');
const Order = require('../models/order');

exports.getIndex = (req, res, next) => {
    Product.find()
        .then(products => {
            res.render('shop/index', {
                products: products,
                pageTitle: 'Shop',
                path: '/'
            });
        })
        .catch(err => console.error(err));
};

exports.getProducts = (req, res, next) => {
    Product.find()
        .then(products => {
            res.render('shop/product-list', {
                products: products,
                pageTitle: 'All products',
                path: '/products'
            });
        })
        .catch(err => console.error(err));
};

exports.getProduct = (req, res, next) => {
    const productId = req.params.productId;
    Product.findById(productId)
        .then(product => {
            res.render('shop/product-detail', {
                pageTitle: product.title,
                product: product,
                path: '/products'
            });
        })
        .catch(err => console.error(err));
};

exports.getCart = (req, res, next) => {
    req.user.getCartProducts()
        .then(products => {
            res.render('shop/cart', {
                path: '/cart',
                pageTitle: 'Your cart',
                products: products
            });
        })
        .catch(err => console.error(err));
};

exports.postCart = (req, res, next) => {
    const productId = req.body.productId;
    Product.findById(productId)
        .then(product => {
            return req.user.addToCart(product);
        })
        .then(result => {
            res.redirect('/cart');
        })
        .catch(err => console.error(err));

};

exports.postCartDeleteItem = (req, res, next) => {
    const productId = req.body.productId;
    req.user.removeFromCart(productId)
        .then(() => {
            res.redirect('/cart');
        })
        .catch(err => console.error(err));
};

exports.postOrder = (req, res, next) => {
    req.user.getCartProducts()
        .then(items => {
            const products = items.map(item => {
                return { product: { ...item.productId._doc }, quantity: item.quantity };
            });
            const order = new Order({
                items: products,
                user: {
                    email: req.user.email,
                    userId: req.user
                }
            });
            return order.save();
        })
        .then(() => req.user.clearCart())
        .then(() => res.redirect('/orders'))
        .catch(err => console.error(err));
};

exports.getOrders = (req, res, next) => {
    Order.find({ 'user.userId': req.user._id })
        .then(orders => {
            res.render('shop/orders', {
                path: '/orders',
                pageTitle: 'Your orders',
                orders: orders
            });
        })
        .catch(err => console.error(err));
};

exports.getCheckout = (req, res, next) => {
    res.render('/shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout'
    });
};



