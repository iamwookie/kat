const express = require('express');
const router = express.Router();

const { version } = require('../../../package.json');

module.exports = (client) => {
    router.get("/", (req, res) => {
        res.send(`${client.user.username} - v${version}`);
    });

    router.use("/users", require("./endpoints/users")(client));

    return router;
};