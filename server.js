require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('./models/user.js');
const Book = require('./models/book.js');
const auth = require('./middleware/auth.js');

const port = process.env.PORT || 3000;
const saltRound = process.env.SALTROUND || 10;
const SECRET_KEY = process.env.SECRET_KEY || 'badsecret';
let app = express();
app.use(express.json());

mongoose.connect(process.env.mongourl, {

})
  .then(() => console.log('Connected to MongoDB...'))

app.use(express.static('public'));

app.post('/api/register', (req, res) => {
  let { firstname, lastname, username, email, password } = req.body;
  if (!(username && email && password)) {
    res.status(400).send('input not filled');
  }
  username = username.toLowerCase();
  email = email.toLowerCase();
  User.findOne().or([{ username }, { email }]).then(user => {
    if (user) {
      res.status(400).send('User already exists');
    } else {
      bcrypt.hash(password, saltRound, function (err, hash) {
        User.create({ firstname: firstname, lastname: lastname, username: username, email: email, password: hash, balance: 0 });
        const token = jwt.sign({ userid: username }, SECRET_KEY, { expiresIn: "24h" });
        res.cookie('token', token).send('User created');
      })
    }
  });
});

app.post('/api/login', async (req, res) => {
  let { username, password } = req.body;
  User.findOne().or([{ username: username }, { email: username }]).then(async (user) => {
    if (user === null) {
      res.status(409).send('user not found');
    }
    else {
      let result = await bcrypt.compare(password, user.password);

      if (result) {
        const token = jwt.sign({ userid: user.username }, SECRET_KEY, { expiresIn: "24h" });
        res.cookie('token', token);
        res.redirect('/index.html');
      }
      else {
        res.status(409).send('failed');
      }
    }
  });
});

app.get('/api/myinfo', auth, (req, res) => {
  User.findOne({ username: req.user }).then(user => {
    let response = {
      firstname: user.firstname,
      middlename: user.middlename,
      lastname: user.lastname,
      username: user.username,
      email: user.email,
      balance: user.balnce
    }
    res.send(response);
  });
});

app.get('/api/books', (req,res) => {
  Book.find().then(books => {
    res.send(books);
  });
});

app.get('/api/book/:id', (req, res) => {
  Book.findOne({ _id: req.params.id }).then(book => {
    res.send(book);
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;