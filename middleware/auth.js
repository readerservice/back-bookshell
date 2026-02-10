const jwt = require('jsonwebtoken');
const env = require('../config/env')

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);
    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, env.jwtSecret);
        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        return res.status(403)
    }
};