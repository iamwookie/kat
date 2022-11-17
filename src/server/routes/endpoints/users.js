const express = require('express');
const router = express.Router();

const { methods } = require('../../middlewares/methods');
const { fetchUser } = require('../../controllers/user');

module.exports = (client) => {
    // /users/:id
    router.get('/:id', methods(['GET']), fetchUser(client));

    return router;
};

