
const { EmbedBuilder } = require('discord.js');

const { hooks } = require('@configs/server.json');
const { asap } = hooks;

exports.unboxHook = client => {
    return async (req, res) => {
        try {
            const body = req.body;
            if (!body) return res.status(400).send('Bad Request');

            const {
                name,
                steamId,
                itemName,
                itemIcon,
                itemColor,
                crateName
            } = body;
            if (
                !name ||
                !steamId ||
                !itemName ||
                !itemIcon ||
                !itemColor ||
                !crateName
            ) return res.status(400).send('Bad Request');

            const embed = new EmbedBuilder()
                .setTitle('ASAP Unbox')
                .setDescription(`**${name}** has received **${itemName}** from **${crateName}** 🎁!`)
                .setThumbnail(`https://i.imgur.com/${itemIcon}.png`)
                .setColor(itemColor)
                .addFields([
                    { name: 'Player', value: `[${name}](https://steamcommunity.com/profiles/${steamId})`, inline: true },
                    { name: 'Item', value: `\`${itemName}\``, inline: true },
                    { name: 'Crate', value: `\`${crateName}\``, inline: true }
                ]);

            for (const c of asap.unbox) {
                const channel = await client.channels.fetch(c);
                if (!channel) return res.status(500).send('Internal Server Error');
                await channel.send({ embeds: [embed] });
            }

            return res.status(200).send('OK');
        } catch (err) {
            console.error('ASAP Controller (ERROR) >> Error Creating Unbox Log'.red);
            console.error(err);

            client.logger?.request(req, 'error', err);

            return res.status(500).send('Internal Server Error');
        }
    };
};

exports.suitsHook = client => {
    return async (req, res) => {
        try {
            const body = req.body;
            if (!body) return res.status(400).send('Bad Request');

            const {
                name,
                steamId,
                itemName,
                itemIcon,
                itemColor,
                killerName
            } = body;
            if (
                !name ||
                !steamId ||
                !itemName ||
                !itemIcon ||
                !itemColor ||
                !killerName
            ) return res.status(400).send('Bad Request');

            const embed = new EmbedBuilder()
                .setTitle('ASAP Suit Rips')
                .setDescription(`**${name}** has lost **${itemName}** to **${killerName}** 💀!`)
                .setThumbnail(`https://i.imgur.com/${itemIcon}.png`)
                .setColor(itemColor)
                .addFields([
                    { name: 'Player', value: `[${name}](https://steamcommunity.com/profiles/${steamId})`, inline: true },
                    { name: 'Suit Lost', value: `\`${itemName}\``, inline: true },
                    { name: 'Killer', value: `\`${killerName}\``, inline: true }
                ]);

            for (const c of asap.suits) {
                const channel = await client.channels.fetch(c);
                if (!channel) return res.status(500).send('Internal Server Error');
                await channel.send({ embeds: [embed] });
            }

            return res.status(200).send('OK');
        } catch (err) {
            console.error('ASAP Controller (ERROR) >> Error Creating Suit Rip Log'.red);
            console.error(err);

            client.logger?.request(req, 'error', err);

            return res.status(500).send('Internal Server Error');
        }
    };
};

exports.staffHook = client => {
    return async (req, res) => {
        try {
            const body = req.body;
            if (!body) return res.status(400).send('Bad Request');

            const {
                ban,
                banLength,
                banReason,
                adminUser,
                adminSid,
                banUser,
                banUserSid,
                banUserProfile,
                banUserAvatar
            } = body;
            if (
                !adminUser ||
                !adminSid ||
                !banUser ||
                !banUserSid ||
                !banUserProfile ||
                !banUserAvatar
            ) return res.status(400).send('Bad Request');

            const embed = new EmbedBuilder()
                .setTitle('ASAP Admin')
                .setDescription(`**${banUser}** has been ${ban}!`)
                .setThumbnail(banUserAvatar)
                .setColor(ban == 'banned' ? '#ff0000' : '#00ff00')
                .addFields([
                    { name: 'Player', value: `[${banUser} (${banUserSid})](${banUserProfile})` },
                    { name: 'Admin', value: `${adminUser} (${adminSid})` }
                ]);

            if (ban == 'banned') {
                embed.addFields([
                    { name: 'Ban Length', value: `\`${banLength}\`` },
                    { name: 'Ban Reason', value: `\`${banReason}\`` }
                ]);
            }

            for (const c of asap.staff) {
                const channel = await client.channels.fetch(c);
                if (!channel) return res.status(500).send('Internal Server Error');
                await channel.send({ embeds: [embed] });
            }

            return res.status(200).send('OK');
        } catch (err) {
            console.error('ASAP Controller (ERROR) >> Error Creating Staff Log'.red);
            console.error(err);

            client.logger?.request(req, 'error', err);

            return res.status(500).send('Internal Server Error');
        }
    };
};