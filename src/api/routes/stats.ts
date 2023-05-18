import { KATClient as Client } from '@structures/index.js';
import { Route } from '@structures/api/Route.js';
import { Request, Response } from 'express';
import { formatBytes } from '@utils/helpers.js';

export class StatsRoute extends Route {
    constructor(client: Client) {
        super(client, '/stats');
    }

    register() {
        this.router.get('/', this.fetchStats);

        return this.router;
    }

    private fetchStats = (req: Request, res: Response) => {
        try {
            const data = {
                uptime: this.client.uptime ?? 0,
                memory_usage: formatBytes(process.memoryUsage().heapUsed),
                ws_ping: this.client.ws.ping,
                guilds: this.client.guilds.cache.size,
                users: this.client.guilds.cache.reduce((a, g) => a + g.memberCount, 0),
            };

            res.json(data);
        } catch (err) {
            this.client.logger.error(err, 'Error Getting Stats', 'User Controller');
            res.status(500).send('Internal Server Error');
        }
    };
}
