const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY || 'badsecret';

const auth = (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) return res.status(401).send('Access denied. No token provided.');
    try {
        const verified = jwt.verify(token, SECRET_KEY);
        req.user = verified.userid;
        next();
    } catch (err) {
        console.error(err);
        res.status(400).send('Invalid token.');
    }
};

module.exports = auth;