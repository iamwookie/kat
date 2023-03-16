import express, { Express, NextFunction, Request, Response } from "express";
import Sentry from "@sentry/node";
import helmet from "helmet";
import bodyParser from "body-parser";
import { Client } from "discord.js";

import chalk from "chalk";
// ------------------------------------
import Config from "@configs/server.json" assert { type: "json" };
// ------------------------------------
import routes from "./routes/index.js";
// ------------------------------------

const app = express();

export default function (client: Client): Promise<Express> {
    return new Promise((resolve, reject) => {
        if (app.get('env') == 'production') app.set('trust proxy', 1);

        app.use(Sentry.Handlers.requestHandler());

        app.use(helmet());
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(express.json());
        app.use(routes(client));
        
        app.use(Sentry.Handlers.errorHandler());

        app.use((err: any, req: Request, res: Response, _: NextFunction) => {
            client.logger.request(req, 'error', err);
            res.status(500).send('Internal Server Error');
            return reject(err);
        });

        app.listen(Config.port, async () => {
            console.log(chalk.greenBright.bold.underline(`>>> Server Initialized On Port: ${Config.port}`));
            return resolve(app);
        });
    });
};




