const express = require('express');
const router = express.Router();

const { withAuth } = require('@server/middlewares/auth');

module.exports = (client) => {
    router.post('/link', require('./link')(client));

    return router;
}