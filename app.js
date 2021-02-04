const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongodbStore = require('connect-mongodb-session')(session);

const dotenv = require('dotenv').config();
const MONGODB_URI = process.env.MONGODB_URI;

const path = require('path');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const errorController = require('./controllers/error-controller');

const User = require('./models/user');

const app = express();
const store = new MongodbStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});

app.set('view engine', 'ejs');
app.set('views', 'views'); // default value

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
    session({
        secret: 'a very long string',
        resave: false,
        saveUninitialized: false,
        store: store
    })
);

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => console.error(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose.connect(
    `${MONGODB_URI}`)
    .then(() => {
        User.findOne()
            .then(user => {
                if (!user) {
                    user = new User({
                        name: 'Aurélien',
                        email: 'aurelienjl@live.fr',
                        cart: {
                            items: []
                        }
                    });
                    user.save();
                }
            })
            .catch(err => console.error(err));
        app.listen(3000);
    })
    .catch(err => console.error(err));