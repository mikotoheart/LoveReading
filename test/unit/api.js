const mocha = require('mocha');
const assert = require('chai').assert;
const request = require('supertest');
const bcrypt = require('bcrypt');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');

const server = require('../../server');
const User = require('../../models/user.js');
const Book = require('../../models/book.js');

const saltRound = Number(process.env.SALTROUND) || 10;
const SECRET_KEY = process.env.SECRET_KEY || 'badsecret';

describe('API', function () {
    var mongoServer, bookid;
    const token = jwt.sign({ userid: 'testingtest' }, SECRET_KEY, { expiresIn: "24h" });
    before(async function () {
        mongoServer = await MongoMemoryServer.create();
        const hash = await bcrypt.hash('testpassword', saltRound);
        User.create({
            firstname: 'Tester',
            lastname: 'Testing',
            username: 'testingtest',
            password: hash,
            email: 'testing@test.com',
            balance: 1000
        });
        const book = new Book({
            title: 'Futurama',
            price: 50,
            img: '/test/test.jpg'
        });
        book.save().then(
            (selectedbook) => {
                bookid = selectedbook._id;
                done();
            }
        )
    });
    it('should register', function () {
        request(server)
            .post('/api/register')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send({
                username: 'oilviacas',
                email: 'oivilacas@gmail.com',
                password: 'test'
            })
            .redirects(1)
            .end(function (err, res) {
                if (err) throw err;
                assert.equal(res.status, 200);
                done();
            });
    });
    it('should not register as invalid input', function () {
        request(server)
            .post('/api/register')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send({
                username: 'oilviacas',
                email: '',
            })
            .expect(400)
            .end(function (err, res) {
                if (err) throw err;
                assert.exists(res.body);
            });
    });
    it('should not register', function () {
        request(server)
            .post('/api/register')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send({
                username: 'testingtest',
                email: 'testing@test.com',
                password: 'testpassword'
            })
            .expect(400)
            .end(function (err, res) {
                if (err) throw err;
                assert.exists(res.body.message);
                done();
            });
    })
    it('should login', function () {
        request(server)
            .post('/api/login')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send({
                username: 'testingtest',
                password: 'testpassword'
            })
            .expect(200)
            .end(function (err, res) {
                if (err) throw err;
                assert.exists(res.body.token);
                done();
            });
    });
    it('should not login', function () {
        request(server)
            .post('/api/login')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send({
            })
            .expect(400)
            .end(function (err, res) {
                if (err) throw err;
                assert.exists(res.body.message);
                done();
            });
    });
    
    it('should not login with invalid cert', function () {
        request(server)
            .post('/api/login')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send({
                username: 'testingtest',
                password: 'noooooooooo'
            })
            .expect(401)
            .end(function (err, res) {
                if (err) throw err;
                assert.exists(res.body.message);
                done();
            });
    });
    it('should get info', function () {
        request(server)
            .get('/api/myinfo')
            .set('auth-token', token)
            .set('Accept', 'applicaion/json')
            .expect(200)
            .end(function (err, res) {
                if (err) throw err;
                assert.exists(res.body.username);
                assert.exists(res.body.email);
                assert.exists(res.body.balance);
                assert.exists(res.body.firstname);
                assert.exists(res.body.lastname);
                done();
            });
    })
    it('should get the books', function () {
        request(server)
            .get('/api/books')
            .set('auth-token', token)
            .set('Accept', 'applicaion/json')
            .expect(200)
            .end(function (err, res) {
                if (err) throw err;
                assert.exists(res.body.books)
                done();
            });
    })
    it('should get one book', function () {
        request(server)
            .get('/api/book/' + bookid)
            .set('auth-token', token)
            .set('Accept', 'applicaion/json')
            .expect(200)
            .end(function (err, res) {
                if (err) throw err;
                assert.exists(res.body.title)
                assert.exists(res.body.price)
                assert.exists(res.body.img)
                done();
            });
    })
    after(async function () {
        await mongoServer.stop();
    });
});
