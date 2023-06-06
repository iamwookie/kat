import { Route } from '../../structures/api/Route.js';
export class PermissionsRoute extends Route {
    constructor(client) {
        super(client, '/permissions');
    }
    register() {
        this.router.get('/', this.fetchPermissions);
        return this.router;
    }
    fetchPermissions = async (req, res) => {
        try {
            const permissions = this.client.permissions.bitfield;
            res.status(200).send({ bitfield: permissions.toString() });
        }
        catch (err) {
            this.client.logger.error(err, 'Error Getting Invite', 'Bot Controller');
            res.status(500).send('Internal Server Error');
        }
    };
}
