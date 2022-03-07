const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
    title: String,
    tag: [String],
    price: Number,
    img: String,
});

module.exports = mongoose.model('Book', BookSchema);