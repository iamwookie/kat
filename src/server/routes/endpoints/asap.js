const express = require('express');
const router = express.Router();

const { withAuth } = require('@server/middlewares/auth');

const { createUnbox, createSuits } = require('@server/controllers/asap');

module.exports = (client) => {
    router.post('/unbox', withAuth(client), createUnbox(client));
    router.post('/suit', withAuth(client), createSuits(client));

    return router;
}