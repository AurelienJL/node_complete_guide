const getDb = require('../util/database').getDb;
const mongodb = require('mongodb');

class Product {
    constructor(title, price, description, imageUrl, _id, userId) {
        this._id = _id ? new mongodb.ObjectId(_id) : null;
        this.title = title;
        this.price = price;
        this.description = description;
        this.imageUrl = imageUrl;
        this.userId = userId;
    }

    save() {
        const db = getDb();
        let dbOp;
        if (this._id) {
            dbOp = db.collection('products')
                .updateOne({ _id: this._id }, { $set: this });
        } else {
            dbOp = db.collection('products').insertOne(this);
        }

        return dbOp
            .then(() => { })
            .catch(err => console.error(err));
    }

    static fetchAll() {
        const db = getDb();
        return db.collection('products')
            .find()
            .toArray()
            .then(products => products)
            .catch(err => console.error(err));
    }

    static findById(productId) {
        const db = getDb();
        return db.collection('products')
            .find({ _id: new mongodb.ObjectId(productId) })
            .next()
            .then(product => {
                return product;
            })
            .catch(err => console.error(err));
    }

    static deleteById(productId) {
        const db = getDb();
        return db.collection('products').deleteOne({ _id: new mongodb.ObjectId(productId) })
            .then(() => { })
            .catch(err => console.error(err));
    }
}

module.exports = Product;
