!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="acffabdd-6c5c-5d94-bc28-5be8e7179956")}catch(e){}}();
import { Router } from 'express';
const router = Router();
import PermissionsRoute from './permissions.js';
import StatsRoute from './stats.js';
import UsersRoute from './users.js';
export default (client) => {
    router.get('/', (req, res) => { res.send(`${client.user?.username} - v${client.config.version}`); });
    router.use('/permissions', PermissionsRoute(client));
    router.use('/stats', StatsRoute(client));
    router.use('/users', UsersRoute(client));
    return router;
};
//# debugId=acffabdd-6c5c-5d94-bc28-5be8e7179956
//# sourceMappingURL=index.js.map
