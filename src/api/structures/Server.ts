import { KATClient as Client } from "@structures/index.js";
import express, { Express, NextFunction, Request, Response } from "express";
import Sentry from "@sentry/node";
import helmet from "helmet";
import bodyParser from "body-parser";

import chalk from "chalk";

// ------------------------------------
import * as Routes from "../routes/index.js";
// ------------------------------------

export class Server {
    public port: number;
    public app: Express;

    constructor(
        public client: Client
    ) {
        this.client = client;
        this.port = client.config.server.port;
        this.app = express();
    }

    public initialize(): Promise<void> {
        return new Promise((resolve) => {
            if (this.app.get("env") == "production") this.app.set("trust proxy", 1);

            this.app.use(Sentry.Handlers.requestHandler());

            this.app.use(helmet());
            this.app.use(bodyParser.urlencoded({ extended: true }));
            this.app.use(express.json());

            this.registerRoutes();

            this.app.use(Sentry.Handlers.errorHandler());

            this.app.use((err: any, req: Request, res: Response, _: NextFunction) => {
                this.client.logger.request(req, "error", err);
                res.status(500).send("Internal Server Error");
            });

            this.app.listen(this.port, () => resolve());
        });
    }

    private registerRoutes(): void {
        const routes = Object.values(Routes);
        if (!routes.length) return;

        for (const Route of routes) {
            try {
                const route = new Route(this.client);
                this.app.use(route.path, route.register());
            } catch (err) {
                this.client.logger.error(err);
                console.error(chalk.red("Server (ERROR) >> Error Registering Route: " + Route.name));
                console.error(err);
            }
        }

        this.client.logger.info(`Server >> Successfully Registered ${routes.length} Route(s)`);
    }
}
