
const Product = require('../models/product');

exports.getIndex = (req, res, next) => {
    Product.fetchAll()
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
    Product.fetchAll()
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
    req.user.deleteProductFromCart(productId)
        .then(result => {
            res.redirect('/cart');
        })
        .catch(err => console.error(err));
};

exports.postOrder = (req, res, next) => {
    let fetchedCart;
    req.user.addOrder()
        .then(result => {
            res.redirect('/orders');
        })
        .catch(err => console.error(err));
};

exports.getOrders = (req, res, next) => {
    req.user.getOrders()
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



