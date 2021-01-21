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
    req.user.createProduct({
        title: title,
        price: price,
        imageUrl: imageUrl,
        description: description
    }).then(result => res.redirect('/admin/products'))
        .catch(err => console.error(err));
};

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (editMode !== 'true') {
        return res.redirect('/');
    }
    const productId = req.params.productId;
    req.user.getProducts({ where: { id: productId } })
        .then(products => {
            if (products[0] == null) {
                return res.redirect('/');
            }
            res.render('admin/edit-product', {
                pageTitle: 'Edit product',
                path: '/admin/edit-product',
                editMode: editMode === 'true',
                product: products[0]
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

    Product.findByPk(productId)
        .then(product => {
            product.title = updatedTitle;
            product.price = updatedPrice;
            product.description = updatedDescription;
            product.imageUrl = updatedImageUrl;
            return product.save();
        })
        .then(result => res.redirect('/admin/products'))
        .catch(err => console.error(err));
};

exports.deleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    Product.findByPk(productId)
        .then(product => {
            return product.destroy();
        })
        .then(result => res.redirect('/admin/products'))
        .catch(err => console.error(err));

};

exports.getProducts = (req, res, next) => {
    req.user.getProducts()
        .then(products => {
            res.render('admin/products', {
                products: products,
                pageTitle: 'All products',
                path: '/admin/products'
            });
        }).catch(err => console.error(err));
};
