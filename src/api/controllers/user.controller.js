!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="e5cb3ab1-b808-5894-bb66-54aa141a38f1")}catch(e){}}();
import { formatUser } from '../../utils/helpers.js';
export const fetchMe = (client) => async (req, res) => {
    try {
        const id = client.config.devs[0];
        const user = await client.users.fetch(id, { force: true });
        if (!user)
            return res.status(404).send('Not Found');
        return res.json(formatUser(user));
    }
    catch (err) {
        client.logger.error(err, 'Error Fetching User', '[API] User Controller');
        // Don't log error as missing user can trigger error
        return res.status(500).send('Internal Server Error');
    }
};
//# debugId=e5cb3ab1-b808-5894-bb66-54aa141a38f1
//# sourceMappingURL=user.controller.js.map
