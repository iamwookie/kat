import { Route } from '../../structures/api/Route.js';
import { fetchInvite } from '../controllers/bot.js';
export class InviteRoute extends Route {
    constructor(client) {
        super(client, '/invite');
    }
    register() {
        this.router.get('/', fetchInvite(this.client));
        return this.router;
    }
}
