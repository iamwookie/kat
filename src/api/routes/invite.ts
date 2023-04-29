import { KATClient as Client } from '@structures/index.js';
import { Route } from '@structures/api/Route.js';

import { fetchInvite } from '@api/controllers/bot.js';

export class InviteRoute extends Route {
    constructor(client: Client) {
        super(client, '/invite');
    }

    register() {
        this.router.get('/', fetchInvite(this.client));

        return this.router;
    }
}
