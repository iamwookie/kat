const express = require('express');
const router = express.Router();

const { version } = require('@root/package.json');
const { withLimiter } = require('@server/middlewares/limiter');

module.exports = (client) => {
    router.get("/", (req, res) => res.send(`${client.user.username} - v${version}`));

    router.use("/users", withLimiter, require("./endpoints/users")(client));

    return router;
};