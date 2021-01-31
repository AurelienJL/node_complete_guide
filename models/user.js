const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    cart: {
        items: [
            {
                productId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true
                }
            }
        ]
    }
});

userSchema.methods.addToCart = function (product) {
    const cartProductIndex = this.cart.items.findIndex(
        item => item.productId.toString() === product._id.toString());

    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];

    if (cartProductIndex >= 0) {
        newQuantity = this.cart.items[cartProductIndex].quantity + 1;
        updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
        updatedCartItems.push({
            productId: product._id,
            quantity: newQuantity
        });
    }
    const updatedCart = {
        items: updatedCartItems
    };
    this.cart = updatedCart;
    return this.save();
};

userSchema.methods.getCartProducts = function () {
    return this.populate('cart.items.productId')
        .execPopulate()
        .then(user => user.cart.items)
        .catch(err => console.error(err));
};

userSchema.methods.removeFromCart = function (productId) {
    const updatedCartItems = this.cart.items.filter(item => item.productId.toString() !== productId.toString());
    this.cart.items = updatedCartItems;
    return this.save();
};

userSchema.methods.clearCart = function () {
    this.cart = { items: [] };
    return this.save();
};

module.exports = mongoose.model('User', userSchema);

// class User {
//     constructor(username, email, cart, _id) {
//         this.username = username;
//         this.email = email;
//         this.cart = cart;
//         this._id = _id;
//     }

//     save() {
//         const db = getDb();
//         return db.collection('users').insertOne(this);
//     }

//     addToCart(product) {
//         const cartProductIndex = this.cart.items.findIndex(
//             item => item.productId.toString() === product._id.toString());

//         let newQuantity = 1;
//         const updatedCartItems = [...this.cart.items];

//         if (cartProductIndex >= 0) {
//             newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//             updatedCartItems[cartProductIndex].quantity = newQuantity;
//         } else {
//             updatedCartItems.push({
//                 productId: new mongodb.ObjectId(product._id),
//                 quantity: newQuantity
//             });
//         }
//         const updatedCart = {
//             items: updatedCartItems
//         };
//         const db = getDb();
//         return db.collection('users')
//             .updateOne(
//                 { _id: new mongodb.ObjectId(this._id) },
//                 { $set: { cart: updatedCart } }
//             );
//     }

//     getCartProducts() {
//         const db = getDb();
//         const productIds = this.cart.items.map(item => item.productId);
//         return db.collection('products')
//             .find({ _id: { $in: productIds } })
//             .toArray()
//             .then(products => {
//                 return products.map(product => {
//                     return {
//                         ...product,
//                         quantity: this.cart.items
//                             .find(item => item.productId.toString() === product._id.toString()).quantity
//                     };
//                 });
//             })
//             .catch(err => console.error(err));
//     }

//     deleteProductFromCart(productId) {
//         const updatedCartItems = this.cart.items.filter(item => item.productId.toString() !== productId.toString());
//         const db = getDb();
//         return db.collection('users')
//             .updateOne(
//                 { _id: new mongodb.ObjectId(this._id) },
//                 { $set: { cart: { items: updatedCartItems } } }
//             );
//     }

//     addOrder() {
//         const db = getDb();
//         return this.getCartProducts()
//             .then(products => {
//                 const order = {
//                     items: products,
//                     user: {
//                         _id: new mongodb.ObjectId(this._id)
//                     }
//                 };
//                 return db.collection('orders').insertOne(order);
//             })
//             .then(result => {
//                 this.cart = { items: [] };
//                 return db.collection('users')
//                     .updateOne(
//                         { _id: new mongodb.ObjectId(this._id) },
//                         { $set: { cart: { items: [] } } }
//                     );
//             })
//             .catch(err => console.error(err));
//     }

//     getOrders() {
//         const db = getDb();
//         return db.collection('orders')
//             .find({ 'user._id': new mongodb.ObjectId(this._id) })
//             .toArray();
//     }

//     static findById(userId) {
//         const db = getDb();
//         return db.collection('users')
//             .find({ _id: new mongodb.ObjectId(userId) })
//             .next()
//             .then(user => {
//                 return user;
//             })
//             .catch(err => console.error(err));
//     }
// }
// module.exports = User;