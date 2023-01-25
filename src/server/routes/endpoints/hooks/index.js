const express = require('express');
const router = express.Router();

const { withAuth } = require('@server/middlewares/auth');

const { version } = require('@root/package.json');

module.exports = (client) => {
    router.get("/", (_, res) => res.send(`${client.user.username} - v${version}`));

    router.use("/asap", withAuth(client), require("./asap")(client));

    return router;
};