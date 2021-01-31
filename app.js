const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const dotenv = require('dotenv').config();
const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD;

const path = require('path');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorController = require('./controllers/error-controller');

const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views'); // default value

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User.findById('601599fdb56f57070c199913')
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => console.error(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose.connect(
    `mongodb+srv://AurelienJL:${MONGODB_PASSWORD}@cluster0.fnw43.mongodb.net/node-shop?retryWrites=true&w=majority`)
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