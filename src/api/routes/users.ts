import { KATClient as Client } from '@structures/index.js';
import { Route } from '@structures/api/Route.js';
import { Request, Response } from 'express';
import { withLimiter } from '@api/middlewares/limiter.js';
import { formatUser } from '@utils/helpers.js';

import chalk from 'chalk';

export class UsersRoute extends Route {
    constructor(client: Client) {
        super(client, '/users');
    }

    register() {
        this.router.get('/:id', withLimiter, this.fetchUser);

        return this.router;
    }

    private fetchUser = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            if (!id) return res.status(400).send('Bad Request');

            const user = await this.client.users.fetch(id, { force: true });
            if (!user) return res.status(404).send('Not Found');

            return res.json(formatUser(user));
        } catch (err) {
            console.error(chalk.red('User Controller (ERROR) >> Error Getting User'));
            console.error(err);

            // Don't log error as missing user can trigger error
            return res.status(500).send('Internal Server Error');
        }
    };
}
