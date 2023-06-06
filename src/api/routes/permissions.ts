import { KATClient as Client } from '@structures/index.js';
import { Route } from '@structures/api/Route.js';
import { Request, Response } from 'express';

export class PermissionsRoute extends Route {
    constructor(client: Client) {
        super(client, '/permissions');
    }

    register() {
        this.router.get('/', this.fetchPermissions);

        return this.router;
    }

    private fetchPermissions = async (req: Request, res: Response) => {
        try {
            const permissions = this.client.permissions.bitfield;
            res.status(200).send({ bitfield: permissions.toString() });
        } catch (err) {
            this.client.logger.error(err, 'Error Getting Invite', 'Bot Controller');
            res.status(500).send('Internal Server Error');
        }
    };
}
