const express = require('express');
const router = express.Router();

const { withLimiter } = require('@server/middlewares/limiter');

const { version } = require('@root/package.json');

module.exports = (client) => {
    router.get('/', (_, res) => res.send(`${client.user.username} - v${version}`));

    router.use('/invite', require('./endpoints/invite')(client));
    router.use('/users', withLimiter, require('./endpoints/users')(client));
    router.use('/hooks', withLimiter, require('./endpoints/hooks')(client));

    return router;
};