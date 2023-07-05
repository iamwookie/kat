!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="636a7b32-472e-5896-91b5-66debf61b42f")}catch(e){}}();
import express from 'express';
import Sentry from '@sentry/node';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
// ------------------------------------
import GlobalRoute from '../../api/routes/index.js';
// ------------------------------------
const __dirname = dirname(fileURLToPath(import.meta.url));
export class Server {
    client;
    app;
    port;
    constructor(client) {
        this.client = client;
        this.port = client.config.server.port;
        this.app = express();
    }
    initialize() {
        return new Promise((resolve) => {
            if (this.app.get('env') == 'production')
                this.app.set('trust proxy', 1);
            this.app.use(Sentry.Handlers.requestHandler());
            this.app.use(helmet());
            this.app.use(bodyParser.urlencoded({ extended: true }));
            this.app.use(express.json());
            const accessLogStream = fs.createWriteStream(path.join(__dirname, '../../../logs/access.log'), { flags: 'a+' });
            this.app.use(morgan('combined', { stream: accessLogStream }));
            this.app.use(GlobalRoute(this.client));
            this.app.use(Sentry.Handlers.errorHandler());
            this.app.listen(this.port, () => resolve());
            this.client.logger.status(`>>> Server Initialized (Port: ${this.client.server.port})`);
        });
    }
}
//# debugId=636a7b32-472e-5896-91b5-66debf61b42f
//# sourceMappingURL=Server.js.map
