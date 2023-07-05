!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="91fef742-f1db-503e-a981-0ab14d82aa8c")}catch(e){}}();
import { formatBytes } from '../../utils/helpers.js';
export const fetchStats = (client) => (req, res) => {
    try {
        const data = {
            uptime: client.uptime ?? 0,
            memory_usage: formatBytes(process.memoryUsage().heapUsed),
            ws_ping: client.ws.ping,
            guilds: client.guilds.cache.size,
            users: client.guilds.cache.reduce((a, g) => a + g.memberCount, 0),
        };
        res.json(data);
    }
    catch (err) {
        client.logger.error(err, 'Error Getting Stats', 'User Controller');
        res.status(500).send('Internal Server Error');
    }
};
//# debugId=91fef742-f1db-503e-a981-0ab14d82aa8c
//# sourceMappingURL=bot.controller.js.map
