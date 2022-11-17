const rateLimit = require('express-rate-limit');

const { server } = require('@root/config.json');

exports.limiter = rateLimit({
    windowMs: server.limiter.duration * 60 * 1000,
    max: server.limiter.max,
    message: 'You\'re being rate limited.',
    standardHeaders: true,
    legacyHeaders: false,
});