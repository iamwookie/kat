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
