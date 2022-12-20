const express = require('express');
const router = express.Router();

const { version } = require('@root/package.json');
const { withLimiter } = require('@server/middlewares/limiter');

module.exports = (client) => {
    router.get("/", (_, res) => res.send(`${client.user.username} - v${version}`));

    router.use("/users", withLimiter, require("./endpoints/users")(client));
    router.use("/asap", withLimiter, require("./endpoints/asap")(client));

    return router;
};