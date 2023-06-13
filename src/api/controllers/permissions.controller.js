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
