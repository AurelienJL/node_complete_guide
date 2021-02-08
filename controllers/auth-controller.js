const User = require('../models/user');
const bcrypt = require('bcryptjs');

exports.getLogin = (req, res, next) => {
    let message = req.flash('errorLogin');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: message
    });
};

exports.getSignup = (req, res, next) => {
    let message = req.flash('errorSignup');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/signup', {
        path: '/login',
        pageTitle: 'Sign up',
        errorMessage: message
    });
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                req.flash('errorLogin', 'Invalid email or password');
                return res.redirect('/login');
            }
            bcrypt.compare(password, user.password)
                .then(doMatch => {
                    if (doMatch) {
                        req.session.user = user;
                        req.session.isLoggedIn = true;
                        return req.session.save(err => { // need to save the session before redirect() in a callback
                            console.error(err);
                            res.redirect('/');
                        });
                    }
                    req.flash('errorLogin', 'Invalid email or password');
                    res.redirect('/login');
                })
                .catch(err => {
                    console.error(err);
                    res.redirect('/login');
                });
        })
        .catch(err => console.error(err));
};

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmedPassword = req.body.confirmedPassword;
    User.findOne({ email: email })
        .then(u => {
            if (u) {
                req.flash('errorSignup', 'e-mail exists already, please pick a different one !');
                return res.redirect('/signup');
            }
            return bcrypt.hash(password, 12)
                .then(hashedPwd => {
                    const user = new User({
                        email: email,
                        password: hashedPwd,
                        cart: { items: [] }
                    });
                    return user.save();
                })
                .then(() => res.redirect('/login'))
                .catch(err => console.error(err));

        })
        .catch(err => console.error(err));
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
};