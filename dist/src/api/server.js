import express from "express";
import Sentry from "@sentry/node";
import helmet from "helmet";
import bodyParser from "body-parser";
import chalk from "chalk";
// ------------------------------------
import routes from "./routes/index.js";
const app = express();
export default function (client) {
    return new Promise((resolve, reject) => {
        if (app.get('env') == 'production')
            app.set('trust proxy', 1);
        app.use(Sentry.Handlers.requestHandler());
        app.use(helmet());
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(express.json());
        app.use(routes(client));
        app.use(Sentry.Handlers.errorHandler());
        app.use((err, req, res, _) => {
            client.logger.request(req, 'error', err);
            res.status(500).send('Internal Server Error');
            return reject(err);
        });
        const port = client.config.server.port;
        app.listen(port, async () => {
            console.log(chalk.greenBright.bold.underline(`>>> Server Initialized On Port: ${port}`));
            return resolve(app);
        });
    });
}
;
