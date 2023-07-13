!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="8e4f27e2-5ea5-5ff5-a50b-871bd9731ef7")}catch(e){}}();
import { Router } from 'express';
import PermissionsRoute from './permissions.js';
import StatsRoute from './stats.js';
import MeRoute from './me.js';
const router = Router();
export default (client) => {
    router.get('/', (_, res) => res.send(`${client.user?.username} - v${client.config.version}`));
    router.use('/permissions', PermissionsRoute(client));
    router.use('/stats', StatsRoute(client));
    router.use('/me', MeRoute(client));
    return router;
};
//# debugId=8e4f27e2-5ea5-5ff5-a50b-871bd9731ef7
//# sourceMappingURL=index.js.map
