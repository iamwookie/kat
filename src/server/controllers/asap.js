
const { EmbedBuilder } = require('discord.js');

const channels = {
    unbox: '1055019802361598023',
    suits: '1054873048160927774'
}

exports.createUnbox = client => {
    return async (req, res) => {
        try {
            const body = req.body;
            if (!body) return res.status(400).send('Bad Request');

            const { name, steamId, itemName, itemIcon, itemColor, crateName } = body;
            if (!name || !steamId || !itemName || !itemIcon || !itemColor || !crateName) return res.status(400).send('Bad Request');

            const channel = await client.channels.fetch(channels.unbox);
            if (!channel) return res.status(500).send('Internal Server Error');

            const embed = new EmbedBuilder()
                .setTitle(`ASAP Unbox`)
                .setDescription(`**${name}** has received **${crateName}** from **${itemName}**!`)
                .setThumbnail(`https://i.imgur.com/${itemIcon}.png`)
                .setColor(itemColor)
                .addFields([
                    { name: 'Steam Profile', value: `[Click here](https://steamcommunity.com/profiles/${steamId})`, inline: true },
                    { name: 'Item', value: `\`${itemName}\``, inline: true },
                    { name: 'Crate', value: `\`${crateName}\``, inline: true }
                ]);

            await channel.send({ embeds: [embed] });

            return res.status(200).send('OK');
        } catch (err) {
            console.error('ASAP Controller (ERROR) >> Error Creating Unbox'.red);
            console.error(err);

            client.logger?.error(err);

            return res.status(500).send('Internal Server Error');
        }
    }
}

exports.createSuits = client => {
    return async (req, res) => {
        try {
            const body = req.body;
            if (!body) return res.status(400).send('Bad Request');

            const { name, steamId, itemName, itemIcon, itemColor, killerName } = body;
            if (!name || !steamId || !itemName || !itemIcon || !itemColor || !killerName) return res.status(400).send('Bad Request');

            const channel = await client.channels.fetch(channels.suits);
            if (!channel) return res.status(500).send('Internal Server Error');

            const embed = new EmbedBuilder()
                .setTitle(`ASAP Suit Rips`)
                .setDescription(`**${name}** has lost **${itemName}** to **${killerName}** 💀!`)
                .setThumbnail(`https://i.imgur.com/${itemIcon}.png`)
                .setColor(itemColor)
                .addFields([
                    { name: 'Steam Profile', value: `[Click here](https://steamcommunity.com/profiles/${steamId})`, inline: true },
                    { name: 'Suit Lost', value: `\`${itemName}\``, inline: true },
                    { name: 'Killer', value: `\`${killerName}\``, inline: true }
                ]);

            await channel.send({ embeds: [embed] });

            return res.status(200).send('OK');
        } catch (err) {
            console.error('ASAP Controller (ERROR) >> Error Creating Suit Rip'.red);
            console.error(err);

            client.logger?.error(err);

            return res.status(500).send('Internal Server Error');
        }
    }
}