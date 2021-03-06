const User = require('../models/user');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator/check');

const dotenv = require('dotenv').config();
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: SENDGRID_API_KEY
    }
}));

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
        errorMessage: message,
        oldInput: { email: "", password: "" },
        validationErrors: []
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
        errorMessage: message,
        oldInput: { email: "", password: "", confirmPassword: "" },
        validationErrors: []
    });
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: errors.array()[0].msg,
            oldInput: { email: email, password: password },
            validationErrors: errors.array()
        });
    }
    User.findOne({ email: email })
        .then(user => {
            console.log({ userAtLogin: user });
            if (!user) {
                return res.status(422).render('auth/login', {
                    path: '/login',
                    pageTitle: 'Login',
                    errorMessage: 'Invalid email or password',
                    oldInput: { email: email, password: password },
                    validationErrors: []
                });
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
                    return res.status(422).render('auth/login', {
                        path: '/login',
                        pageTitle: 'Login',
                        errorMessage: 'Invalid email or password',
                        oldInput: { email: email, password: password },
                        validationErrors: []
                    });
                })
                .catch(err => {
                    res.redirect('/login');
                });

        }).catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/signup', {
            path: '/login',
            pageTitle: 'Sign up',
            errorMessage: errors.array()[0].msg,
            oldInput: { email: email, password: password, confirmPassword: confirmPassword },
            validationErrors: errors.array()
        });
    }
    bcrypt.hash(password, 12)
        .then(hashedPwd => {
            const user = new User({
                email: email,
                password: hashedPwd,
                cart: { items: [] }
            });
            return user.save();
        })
        .then(() => {
            res.redirect('/login');
            return transporter.sendMail({
                to: email,
                from: 'aurelienjl@live.fr',
                subject: 'Reset password',
                html: '<h1>Mail envoyé depuis NodeJS</h1><br><h2>Bisous</h2>'
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
};

exports.getReset = (req, res, next) => {
    let message = req.flash('errorReset');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset password',
        errorMessage: message
    });
};

exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.error(err);
            return res.redirect('/');
        }
        const token = buffer.toString('hex');
        User.findOne({ email: req.body.email })
            .then(user => {
                if (!user) {
                    req.flash('errorReset', 'No account with that email found');
                    return res.redirect('/reset');
                }
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000;
                return user.save();
            })
            .then(() => {
                res.redirect('/');
                return transporter.sendMail({
                    to: req.body.email,
                    from: 'aurelienjl@live.fr',
                    subject: 'Password reset',
                    html: `
                    <p>You requested a password reset</p>
                    <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password</p>
                    `
                });
            })
            .catch(err => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
    });
};

exports.getNewPassword = (req, res, next) => {

    const token = req.params.token;
    User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
        .then(user => {
            let message = req.flash('error');
            if (message.length > 0) {
                message = message[0];
            } else {
                message = null;
            }
            res.render('auth/new-password', {
                path: '/new-password',
                pageTitle: 'New password',
                errorMessage: message,
                userId: user._id.toString(),
                passwordToken: token
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;

    let resetUser;
    User.findOne({
        resetToken: passwordToken,
        resetTokenExpiration: { $gt: Date.now() },
        _id: userId
    })
        .then(user => {
            resetUser = user;
            return bcrypt.hash(newPassword, 12);
        })
        .then(hashedPassword => {
            resetUser.password = hashedPassword;
            resetUser.resetToken = undefined;
            resetUser.resetTokenExpiration = undefined;
            return resetUser.save();
        })
        .then(() => res.redirect('/'))
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};