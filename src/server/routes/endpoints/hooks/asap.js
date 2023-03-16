const express = require('express');
const router = express.Router();

const { sendUnbox, sendSuits, sendStaff } = require('@server/controllers/hooks/asap');

module.exports = client => {
    // /hooks/asap/unbox
    router.post('/unbox', sendUnbox(client));

    // /hooks/asap/suit
    router.post('/suits', sendSuits(client));

    // /hooks/asap/staff
    router.post('/staff', sendStaff(client));

    return router;
}