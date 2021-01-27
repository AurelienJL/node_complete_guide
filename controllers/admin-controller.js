const { fetchAll } = require('../models/product');
const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add product',
        path: '/admin/add-product',
        editMode: false
    });
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const description = req.body.description;
    const price = req.body.price;
    const product = new Product(title, price, description, imageUrl, null, req.user._id);
    product.save()
        .then(result => res.redirect('/admin/products'))
        .catch(err => console.error(err));
};

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (editMode !== 'true') {
        return res.redirect('/');
    }
    const productId = req.params.productId;
    Product.findById(productId)
        .then(product => {
            if (!product) {
                return res.redirect('/');
            }
            res.render('admin/edit-product', {
                pageTitle: 'Edit product',
                path: '/admin/edit-product',
                editMode: editMode === 'true',
                product: product
            });
        })
        .catch(err => console.error(err));

};

exports.postEditProduct = (req, res, next) => {
    const productId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedImageUrl = req.body.imageUrl;
    const updatedDescription = req.body.description;
    const product = new Product(
        updatedTitle,
        updatedPrice,
        updatedDescription,
        updatedImageUrl,
        productId
    );
    product.save()
        .then(result => res.redirect('/admin/products'))
        .catch(err => console.error(err));
};

exports.deleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    Product.deleteById(productId)
        .then(result => res.redirect('/admin/products'))
        .catch(err => console.error(err));

};

exports.getProducts = (req, res, next) => {
    Product.fetchAll()
        .then(products => {
            res.render('admin/products', {
                products: products,
                pageTitle: 'All products',
                path: '/admin/products'
            });
        }).catch(err => console.error(err));
};
