!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="27821a91-2ef8-5aa1-bfba-0e7e928329b3")}catch(e){}}();
export const fetchPermissions = (client) => (req, res) => {
    try {
        const permissions = client.permissions.bitfield;
        res.status(200).send({ bitfield: permissions.toString() });
    }
    catch (err) {
        client.logger.error(err, 'Error Getting Invite', 'Bot Controller');
        res.status(500).send('Internal Server Error');
    }
};
//# debugId=27821a91-2ef8-5aa1-bfba-0e7e928329b3
//# sourceMappingURL=permissions.controller.js.map
