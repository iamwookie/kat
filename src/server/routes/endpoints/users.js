const express = require('express');
const router = express.Router();

const { fetchUser } = require('@server/controllers/user');

module.exports = (client) => {
    // /users/:id
    router.get('/:id', fetchUser(client));

    return router;
};

