import { Route } from '../../structures/api/Route.js';
export class InviteRoute extends Route {
    constructor(client) {
        super(client, '/invite');
    }
    register() {
        this.router.get('/', this.fetchInvite);
        return this.router;
    }
    fetchInvite = async (req, res) => {
        try {
            const url = new URL('https://discord.com/api/oauth2/authorize');
            url.searchParams.append('client_id', process.env.DISCORD_APP_ID);
            url.searchParams.append('permissions', req.query.admin ? '8' : this.client.permissions?.bitfield.toString());
            url.searchParams.append('scope', 'bot applications.commands');
            res.redirect(url.toString());
        }
        catch (err) {
            this.client.logger.error(err, 'Error Getting Invite', 'Bot Controller');
            res.status(500).send('Internal Server Error');
        }
    };
}
