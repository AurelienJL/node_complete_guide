const { fetchAll } = require('../models/product');
const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add product',
        path: '/admin/add-product',
        editMode: false,
        isAuthenticated: req.session.isLoggedIn
    });
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const description = req.body.description;
    const price = req.body.price;
    const product = new Product({
        title: title,
        price: price,
        description: description,
        imageUrl: imageUrl,
        userId: req.user // mongoose will pick the id from the user object
    });
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
                product: product,
                isAuthenticated: req.session.isLoggedIn
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

    Product.findById(productId)
        .then(product => {
            product.title = updatedTitle;
            product.price = updatedPrice;
            product.imageUrl = updatedImageUrl;
            product.description = updatedDescription;
            return product.save();
        })
        .then(result => res.redirect('/admin/products'))
        .catch(err => console.error(err));
};

exports.deleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    Product.findByIdAndDelete(productId)
        .then(result => res.redirect('/admin/products'))
        .catch(err => console.error(err));

};

exports.getProducts = (req, res, next) => {
    Product.find()
        // .populate('userId', 'name') // populate the user object and retrieve only user.name
        // .select('title price -_id') // which field should be retrieve -or exclude from the db 
        .then(products => {
            res.render('admin/products', {
                products: products,
                pageTitle: 'All products',
                path: '/admin/products',
                isAuthenticated: req.session.isLoggedIn
            });
        }).catch(err => console.error(err));
};
