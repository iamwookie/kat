import { KATClient as Client } from '@structures/Client';
import { Request, Response } from 'express';

export const fetchPermissions = (client: Client) => (req: Request, res: Response) => {
    try {
        const permissions = client.permissions.bitfield;
        res.status(200).send({ bitfield: permissions.toString() });
    } catch (err) {
        client.logger.error(err, 'Error Getting Invite', 'Bot Controller');
        res.status(500).send('Internal Server Error');
    }
}