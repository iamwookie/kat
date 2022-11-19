const { ChannelType } = require('discord.js');
const Commander = require('@commander');
const { SlashCommandBuilder } = require('@discordjs/builders');
const TwitchManager = require('@libs/twitch/twitchmanager');
const ActionEmbed = require('@utils/embeds/action');
const TwitchEmbed = require('@utils/embeds/twitch');
// -----------------------------------

module.exports = {
    name: 'live',
    group: 'Twitch',
    description: 'Send live stream announcement.',

    // AUTHORIZATION
    guilds: [],
    users: [],

    // SLASH
    data() {
        return (
            new SlashCommandBuilder()
                .setName(this.name)
                .setDescription(this.description)
                .addSubcommand(sub => {
                    return sub.setName('send')
                        .setDescription('Send the livestream message.');
                })
                .addSubcommand(sub => {
                    return sub.setName('setup')
                        .setDescription('Setup twitch.')
                        .addStringOption(option => {
                            return option.setName('username')
                                .setDescription('Your twitch channel name without the URL. (e.g `ninja`)')
                                .setRequired(true);
                        })
                        .addChannelOption(option => {
                            return option.setName('channel')
                                .setDescription('The channel to announce in.')
                                .addChannelTypes(ChannelType.GuildText)
                                .setRequired(true);
                        });
                })
        );
    },

    async run(client, int) {
        if (!client.database) return int.editReply({ embeds: [new ActionEmbed('fail', 'Database not online!', int.user)] });

        if (!client.twitch) client.twitch = TwitchManager.initialize(client);

        let command = int.options.getSubcommand();

        if (command == 'setup') {
            let username = int.options.getString('username');
            let channel = await client.twitch.getUserByUserName(username);

            if (!channel) return int.editReply({ embeds: [new ActionEmbed('fail', 'Invalid twich user provided!', int.user)] });

            let announce = int.options.getChannel('channel');

            if (!announce) return int.editReply({ embeds: [new ActionEmbed('fail', 'Invalid channel provided!', int.user)] });

            await client.database.set(int.guildId, 'twitch', { 'user': username, 'channels': [announce.id] });
            if (client.twitch) await client.twitch.registerListeners();

            let success = new ActionEmbed('success', 'Setup complete!', int.user);
            success.setTitle('Twitch Setup');
            success.addFields([
                { name: 'User', value: `[${username}](https://twitch.tv/${username})` },
                { name: 'Channel', value: `\`#${announce.name}\`` }
            ]);

            return int.editReply({ embeds: [success] });
        }

        if (command == 'send') {
            await int.editReply({ embeds: [new ActionEmbed('load', 'Searching...', int.user)] });

            let info = await client.database.get(int.guildId, 'twitch');

            if (!info) return int.editReply({ embeds: [new ActionEmbed('fail', 'You have not completed the setup. Try running the command: `/live setup`', int.user)] });

            let stream = await client.twitch.getStreamByUserName(info.user);

            if (!stream) return int.editReply({ embeds: [new ActionEmbed('fail', 'User is not streaming!', int.user)] });

            let user = await stream.getUser();
            let image = await stream.getThumbnailUrl(1280, 720);

            let embed = new TwitchEmbed(user, stream, image);

            for (const channelId of info.channels) {
                try {
                    let channel = await int.guild.channels.fetch(channelId);
                    if (channel) channel.send({ content: "@everyone", embeds: [embed] });
                } catch (err) {
                    console.error(`Guild Commands (ERROR) (${int.guild.id}) >> live: Failed To Fetch Channel`.red);
                    console.error(err);
                    Commander.handleError(client, err);

                    return int.editReply({ embeds: [new ActionEmbed('fail', 'Failed to send message(s)! Are you sure I have enough permissions? Try running the setup again if this message keeps appearing.', int.user)] });
                }
            }

            let success = new ActionEmbed('success', 'Message(s) sent!', int.user);
            return int.editReply({ embeds: [success] });
        }
    }
};