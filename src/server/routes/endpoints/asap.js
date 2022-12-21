const express = require('express');
const router = express.Router();

const { withAuth } = require('@server/middlewares/auth');

const { createUnbox, createSuits, createStaff } = require('@server/controllers/asap');

module.exports = (client) => {
    router.post('/unbox', withAuth(client), createUnbox(client));
    router.post('/suit', withAuth(client), createSuits(client));
    router.post('/staff', withAuth(client), createStaff(client));

    return router;
}