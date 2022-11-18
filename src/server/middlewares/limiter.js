const rateLimit = require('express-rate-limit');

const { limiter } = require('@configs/server.json');

exports.withLimiter = rateLimit({
    windowMs: limiter.duration * 60 * 1000,
    max: limiter.max,
    message: 'You\'re being rate limited.',
    standardHeaders: true,
    legacyHeaders: false,
});