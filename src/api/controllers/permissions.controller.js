!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="ec7784f9-e5c3-5f85-b647-1e30131b3f53")}catch(e){}}();
import { PermissionsBitField } from 'discord.js';
export const fetchPermissions = (client) => (req, res) => {
    try {
        const permissions = new PermissionsBitField(Object.values(client.permissions)).bitfield;
        res.status(200).send({ bitfield: permissions.toString() });
    }
    catch (err) {
        client.logger.error(err, 'Error Getting Invite', 'Bot Controller');
        res.status(500).send('Internal Server Error');
    }
};
//# debugId=ec7784f9-e5c3-5f85-b647-1e30131b3f53
//# sourceMappingURL=permissions.controller.js.map
