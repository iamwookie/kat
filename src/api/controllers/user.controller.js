!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="a684e89d-ed60-5f3e-865f-18207014ebee")}catch(e){}}();
import { formatUser } from '../../utils/helpers.js';
export const fetchUser = (client) => async (req, res) => {
    try {
        const id = req.params.id;
        if (!id)
            return res.status(400).send('Bad Request');
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
//# debugId=a684e89d-ed60-5f3e-865f-18207014ebee
//# sourceMappingURL=user.controller.js.map
