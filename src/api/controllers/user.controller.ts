import { KATClient as Client } from '@structures/Client';
import { Request, Response } from 'express';
import { formatUser } from '@utils/helpers.js';

export const fetchMe = (client: Client) => async (req: Request, res: Response) => {
    try {
        const id = client.config.devs[0];
        const user = await client.users.fetch(id, { force: true });
        if (!user) return res.status(404).send('Not Found');

        return res.json(formatUser(user));
    } catch (err) {
        client.logger.error(err, 'Error Fetching User', '[API] User Controller');
        // Don't log error as missing user can trigger error
        return res.status(500).send('Internal Server Error');
    }
};