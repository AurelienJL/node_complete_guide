const User = require('../models/user');
exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isAuthenticated: false
    });
};

exports.postLogin = (req, res, next) => {
    User.findById('601599fdb56f57070c199913')
        .then(user => {
            req.session.user = user;
            req.session.isLoggedIn = true;
            req.session.save(err => { // need to save the session before redirect() in a callback
                console.error(err);
                res.redirect('/');
            });
        })
        .catch(err => console.error(err));
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
};