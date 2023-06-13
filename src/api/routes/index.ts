import { KATClient as Client } from '@structures/Client.js';
import { Router } from 'express';
const router = Router();

import PermissionsRoute from './permissions.js';
import StatsRoute from './stats.js';
import UsersRoute from './users.js';

export default (client: Client) => {
    router.get('/', (req, res) => { res.send(`${client.user?.username} - v${client.config.version}`) });
    router.use('/permissions', PermissionsRoute(client));
    router.use('/stats', StatsRoute(client));
    router.use('/users', UsersRoute(client));
    return router;
}
