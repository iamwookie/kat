const express = require('express');
const router = express.Router();

const { unboxHook, suitsHook, staffHook } = require('@server/controllers/hooks/asap');

module.exports = (client) => {
    // /hooks/asap/unbox
    router.post('/unbox', unboxHook(client));

    // /hooks/asap/suit
    router.post('/suits', suitsHook(client));

    // /hooks/asap/staff
    router.post('/staff', staffHook(client));

    return router;
}