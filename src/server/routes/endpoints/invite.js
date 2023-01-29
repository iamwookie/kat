const express = require('express');
const router = express.Router();

const { fetchInvite } = require('@server/controllers/invite');

module.exports = client => {
    // /users/:id
    router.get('/', fetchInvite(client));

    return router;
};
