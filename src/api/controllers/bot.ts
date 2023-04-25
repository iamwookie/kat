import { KATClient as Client } from '@structures/index.js';
import { Request, Response } from 'express';
import { formatBytes } from '@utils/helpers.js';

export function fetchStats(client: Client) {
    return async (req: Request, res: Response) => {
        try {
            const data = {
                uptime: client.uptime ?? 0,
                memory_usage: formatBytes(process.memoryUsage().heapUsed),
                ws_ping: client.ws.ping,
                guilds: client.guilds.cache.size,
                users: client.guilds.cache.reduce((a, g) => a + g.memberCount, 0),
            };
            res.json(data);
        } catch (err) {
            client.logger.error(err, 'Error Getting Stats', 'Bot Controller');
            res.status(500).send('Internal Server Error');
        }
    };
}

export function fetchInvite(client: Client) {
    return async (req: Request, res: Response) => {
        try {
            const url = new URL('https://discord.com/api/oauth2/authorize');
            url.searchParams.append('client_id', process.env.DISCORD_APP_ID!);
            url.searchParams.append('permissions', req.query.admin ? '8' : client.permissions?.bitfield.toString());
            url.searchParams.append('scope', 'bot applications.commands');
            res.redirect(url.toString());
        } catch (err) {
            client.logger.error(err, 'Error Getting Invite', 'Bot Controller');
            res.status(500).send('Internal Server Error');
        }
    };
}
