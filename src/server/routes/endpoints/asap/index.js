const express = require('express');
const router = express.Router();

const { withAuth } = require('@server/middlewares/auth');

const { createUnbox } = require('@server/controllers/asap');

module.exports = (client) => {
    router.post('/unbox', withAuth, createUnbox(client));

    return router;
}