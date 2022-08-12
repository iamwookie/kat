const express = require('express');
const router = express.Router();

const { version } = require('@root/package.json');
const { limiter } = require('@providers/authenticator');

module.exports = (client) => {
    router.get("/", (req, res) => {
        res.send(`${client.user.username} - v${version}`);
    });

    router.use("/users", limiter(), require("./endpoints/users")(client));

    return router;
};