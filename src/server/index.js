const express = require('express');
const helmet = require('helmet');
const bodyParser = require("body-parser");
// ------------------------------------
const { server } = require('@root/config.json');
const { handler } = require('@providers/authenticator');

const app = express();

module.exports = (client) => {
    return new Promise((resolve, reject) => {
        if (app.get('env') == 'production') app.set('trust proxy', 1);

        app.use(helmet());
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(express.json());
        app.use(require('./routes')(client));
        app.use(handler());

        app.listen(server.port, async (err) => {
            if (err) return reject(err);
            console.log(`>>> Server Initialized On Port: ${server.port}`.brightGreen.bold.underline);
            return resolve(app);
        });
    });
};



