const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firstname: String,
    middlename: String,
    lastname: String,
    username: String,
    password: String,
    email: String,
    balance: Number 
});

module.exports = mongoose.model('User', UserSchema);