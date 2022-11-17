// Auth controller for express

const { log } = require('../utils/logs');

exports.authorize = (req, res, next) => {
    if (!req.headers.authorization || req.headers.authorization != process.env.API_KEY) {
        console.log('>> Unauthorized Request Received'.red);
        log(req, 'Unauthorized', 'access');

        return res.status(401).send('You are not authorized.');
    }

    next();
};