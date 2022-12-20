const express = require('express');
const router = express.Router();

const { withAuth } = require('@server/middlewares/auth');
const { createRip } = require('@server/controllers/rips');

module.exports = (client) => {
    router.post('/rips', withAuth, createRip(client));

    return router;
}