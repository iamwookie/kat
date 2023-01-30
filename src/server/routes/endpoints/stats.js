const express = require('express');
const router = express.Router();

const { fetchStats } = require('@server/controllers/kat');

module.exports = client => {
    // /users/:id
    router.get('/', fetchStats(client));

    return router;
};