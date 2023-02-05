const { formatTime, formatBytes } = require('@utils/formatters');

exports.fetchStats = client => {
    return async (req, res) => {
        try {
            const data = {
                uptime: formatTime(client.uptime),
                ram_usage: formatBytes(process.memoryUsage().heapUsed),
                ws_ping: client.ws.ping,
                guilds: client.guilds.cache.size,
                users: client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)
            }
            
            return res.json(data);
        } catch (err) {
            client.logger?.request(req, 'error', err);
            console.error('Stats Controller (ERROR) >> Error Getting Stats'.red);
            console.error(err);

            return res.status(500).send('Internal Server Error');
        }
    }
}

exports.fetchInvite = client => {
    return async (req, res) => {
        try {
            const url = new URL('https://discord.com/api/oauth2/authorize');
            url.searchParams.append('client_id', process.env.BOT_APP_ID);
            url.searchParams.append('permissions', req.query.admin ? 8 : client.permissions?.bitfield);
            url.searchParams.append('scope', 'bot applications.commands');

            return res.redirect(url.toString())
        } catch (err) {
            client.logger?.request(req, 'error', err);
            console.error('Invite Controller (ERROR) >> Error Getting Invite'.red);
            console.error(err);

            return res.status(500).send('Internal Server Error');
        }
    }
}