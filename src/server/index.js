const express = require('express');
const helmet = require('helmet');
const bodyParser = require("body-parser");
// ------------------------------------
const { port } = require('@configs/server.json');

const app = express();

module.exports = (client) => {
    return new Promise((resolve, reject) => {
        if (app.get('env') == 'production') app.set('trust proxy', 1);

        app.use(helmet());
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(express.json());
        app.use(require('./routes')(client));

        app.use((err, req, res, _) => {
            client.logger?.request(req, 'error', err);
            return res.status(500).send('Internal Server Error');
        });

        app.listen(port, async (err) => {
            if (err) return reject(err);
            console.log(`>>> Server Initialized On Port: ${port}`.brightGreen.bold.underline);
            return resolve(app);
        });
    });
};




