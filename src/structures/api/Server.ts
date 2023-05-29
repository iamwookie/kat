import { KATClient as Client } from '../Client.js';
import express, { Express } from 'express';
import Sentry from '@sentry/node';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { Events } from 'discord.js';

// ------------------------------------
import * as Routes from '@api/routes/index.js';
// ------------------------------------

const __dirname = dirname(fileURLToPath(import.meta.url));

export class Server {
    public app: Express;
    public port: number;

    constructor(public client: Client) {
        this.port = client.config.server.port;
        this.app = express();
    }

    public initialize(): Promise<void> {
        return new Promise((resolve) => {
            if (this.app.get('env') == 'production') this.app.set('trust proxy', 1);

            this.app.use(Sentry.Handlers.requestHandler());

            this.app.use(helmet());
            this.app.use(bodyParser.urlencoded({ extended: true }));
            this.app.use(express.json());

            const accessLogStream = fs.createWriteStream(path.join(__dirname, '../../../logs/access.log'), { flags: 'a+' });
            this.app.use(morgan('combined', { stream: accessLogStream }));

            this.registerRoutes();

            this.app.use(Sentry.Handlers.errorHandler());

            this.app.listen(this.port, () => resolve());
        });
    }

    private registerRoutes(): void {
        const routes = Object.values(Routes);

        for (const Route of routes) {
            try {
                const route = new Route(this.client);
                this.app.use(route.path, route.register());
            } catch (err) {
                this.client.logger.error(err, 'Error Registering Route', 'Server');
            }
        }

        this.client.emit(Events.Debug, `Server >> Successfully Registered ${routes.length} Route(s)`);
    }
}
