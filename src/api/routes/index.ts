import { KATClient as Client } from '@structures/Client.js';
import { Router } from 'express';

import PermissionsRoute from './permissions.js';
import StatsRoute from './stats.js';
import MeRoute from './me.js';

const router = Router();

export default (client: Client) => {
    router.get('/', (_, res) => res.send(`${client.user?.username} - v${client.config.version}`));
    router.use('/permissions', PermissionsRoute(client));
    router.use('/stats', StatsRoute(client));
    router.use('/me', MeRoute(client));
    return router;
};
