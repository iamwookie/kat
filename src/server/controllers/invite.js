exports.fetchInvite = client => {
    return async (req, res) => {
        try {
            const url = new URL('https://discord.com/api/oauth2/authorize');
            url.searchParams.append('client_id', process.env.BOT_APP_ID);
            url.searchParams.append('permissions', client.permissions?.bitfield);
            url.searchParams.append('scope', 'bot applications.commands');

            return res.redirect(301, url.toString())
        } catch (err) {
            client.logger?.request(req, 'error', err);
            console.error('Invite Controller (ERROR) >> Error Getting Invite'.red);
            console.error(err);

            return res.status(500).send('Internal Server Error');
        }
    }
}