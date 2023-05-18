import { Route } from '../../structures/api/Route.js';
import { withLimiter } from '../middlewares/limiter.js';
import { formatUser } from '../../utils/helpers.js';
import chalk from 'chalk';
export class UsersRoute extends Route {
    constructor(client) {
        super(client, '/users');
    }
    register() {
        this.router.get('/:id', withLimiter, this.fetchUser);
        return this.router;
    }
    fetchUser = async (req, res) => {
        try {
            const id = req.params.id;
            if (!id)
                return res.status(400).send('Bad Request');
            const user = await this.client.users.fetch(id, { force: true });
            if (!user)
                return res.status(404).send('Not Found');
            return res.json(formatUser(user));
        }
        catch (err) {
            console.error(chalk.red('User Controller (ERROR) >> Error Getting User'));
            console.error(err);
            // Don't log error as missing user can trigger error
            return res.status(500).send('Internal Server Error');
        }
    };
}
