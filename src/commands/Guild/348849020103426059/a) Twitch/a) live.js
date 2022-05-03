const config = require('@root/config');
const Discord = require('discord.js');
const Commander = require('@commander/commander');
const TwitchManager = require('@core/twitch/twitchmanager');
const { successEmbed, failEmbed, loadEmbed } = require('@utils/other/embeds');
// -----------------------------------

module.exports = {
    name: 'live',
    group: 'Twitch',
    description: 'Send live stream announcement.',
    
    // AUTHORIZATION
    guilds: ['348849020103426059', '729660181226455160'],
    users: ['182543450753728524'],
    
    async run(client, msg, args) {
        TwitchManager.initialize(client);

        let wait = loadEmbed('Searching...', msg.author);

        if (args && args.split(' ')[0].trim() == 'setup') {
            let embed = new Discord.MessageEmbed()
            .setColor('PURPLE')
            .setAuthor({ name: msg.author.tag, iconURL: msg.author.avatarURL({ dynamic: true }) })
            .setTitle('Twitch Setup')

            embed.setDescription('Please provide your twitch channel name without the URL. (e.g `ninja`)');

            msg.reply({ embeds: [embed] }).then(async () => {
                let collected = await msg.channel.awaitMessages({ max: 1, time: config.twitch.timeout });

                if (!collected.size) {
                    let timedOut = failEmbed('Setup timed out! Try again!', msg.author);
                    return msg.reply({ embeds: [timedOut] });
                }

                let response = await msg.channel.send({ embeds: [wait] });
                let username = collected.first().content.trim();
                let channel = await client.twitch.getUserByUserName(username);

                if (!channel) {
                    let notFound = failEmbed('Invalid channel name provided!', msg.author);
                    return response.edit({ embeds: [notFound] });
                }

                embed.setDescription('Please provide the channel ID of the channels to announce in, seperated by a comma. (e.g `928961524201033778,894232652679356417`)');

                response.edit({ embeds: [embed] }).then(async () => {
                    let collected = await msg.channel.awaitMessages({ max: 1, time: config.twitch.timeout });

                    if (!collected.size) {
                        let timedOut = failEmbed('Setup timed out! Try again!', msg.author);
                        return msg.reply({ embeds: [timedOut] });
                    }

                    let response = await msg.channel.send({ embeds: [wait] });
                    let channels = collected.first().content.trim().split(',');

                    for (const channel of channels) {
                        if (!msg.guild.channels.cache.has(channel)) {
                            let notFound = failEmbed('Invalid channel ID(s) provided!', msg.author);
                            return response.edit({ embeds: [notFound] });
                        }
                    }

                    await client.database.set(msg.guildId, 'twitch', { 'user': username, 'channels': channels });

                    let success = successEmbed('Setup complete!', msg.author);
                    success.setTitle('Twitch Setup');
                    success.addFields(
                        { name: 'User', value: `[${username}](https://twitch.tv/${username})` },
                        { name: 'Channels', value: `\`${channels.join(', ')}\`` }
                    );

                    return response.edit({ embeds: [success] });
                });
            });
        } else {
            msg.reply({ embeds: [wait] }).then(async m => {
                let info = await client.database.get(msg.guildId, 'twitch');
    
                if (!info) {
                    let notFound = failEmbed('You have not completed the setup. Try running the command: `live setup`', msg.author);
                    return m.edit({ embeds: [notFound] });
                }
    
                let stream = await client.twitch.getStreamByUserName(info.user);
    
                if (!stream) {
                    let fail = failEmbed('User is not streaming!', msg.author);
                    return m.edit({embeds: [fail]}).then((msg) => setTimeout(() => msg.delete(), 5000));
                }
    
                let user = await stream.getUser();
                let imageURL = await stream.getThumbnailUrl(1280, 720);
    
                let embed = new Discord.MessageEmbed()
                .setColor('#9146ff')
                .setAuthor({ name: `${stream.userDisplayName} is NOW LIVE!!`, iconURL: user.profilePictureUrl, URL: `https://www.twitch.tv/${user.name}` })
                .setTitle(stream.title)
                .setURL(`https://www.twitch.tv/${user.name}`)
                .addFields(
                    { name: 'Playing', value: stream.gameName, inline: true },
                    { name: 'Viewers', value: stream.viewers.toString(), inline: true },
                    { name: '-----------------------------------------------------------', value: `[Click here to watch now!](https://www.twitch.tv/${user.name})` }
                )
                .setImage(imageURL);
    
                for (const channelId of info.channels) {
                    try {
                        let channel = await msg.guild.channels.fetch(channelId);
                        if (channel) channel.send({ content: "@everyone", embeds: [embed] });
                    } catch (err) {
                        Commander.handleError(client, err, false);
                        console.error(`Guild Commands (ERROR) (${this.guilds[0]}) >> live: Failed To Fetch Channel`.red); 
                        console.error(err);
                        
                        let fail = failEmbed('Failed to send message(s)! Are you sure I have enough permissions? Try running the setup again if this message keeps appearing.', msg.author);
                        return m.edit({ embeds: [fail] }).then(msg => setTimeout(() => msg.delete(), 5000));
                    }
                }
    
                let success = successEmbed('Message(s) sent!', msg.author);
                m.edit({ embeds: [success] });
            });
        }
    }
};