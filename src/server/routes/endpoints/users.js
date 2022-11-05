const express = require('express');
const router = express.Router();

module.exports = (client) => {
    // /users/:id
    router.get('/:id', async (req, res) => {
        try {
            const id = req.params.id;
            if (!id) return res.status(400).send('Bad Request');
            const user = await client.users.fetch(id, { force: true });
            if (!user) return res.status(404).send('Not Found');
            return res.json(parseUser(user));
        } catch (err) {
            console.error('Requests [users] (ERROR) >> Error Getting users/:id'.red);
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }
    });

    return router;
};

function parseUser(user) {
    return {
        id: user.id,
        username: user.username,
        discriminator: user.discriminator,
        tag: user.tag,
        avatarURL: user.avatarURL({ dynamic: true }),
        bannerURL: user.bannerURL({ dynamic: true }),
        accentHex: user.hexAccentColor,
    };
}