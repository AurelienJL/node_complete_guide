const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
let _db;

const dotenv = require('dotenv').config();
const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD;

const mongoConnect = (callback) => {
    MongoClient.connect(
        `mongodb+srv://AurelienJL:${MONGODB_PASSWORD}@cluster0.fnw43.mongodb.net/node-shop?retryWrites=true&w=majority`)
        .then(client => {
            console.log('Connected');
            _db = client.db();
            callback();
        })
        .catch(err => {
            console.error(err);
            throw err;
        });
};

const getDb = () => {
    if (_db) {
        return _db;
    }
    throw 'No database found';
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;