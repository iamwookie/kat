const { SlashCommandBuilder, ChannelType } = require('discord.js');

const TwitchManager = require('@lib/twitch/manager');

const ActionEmbed = require('@utils/embeds/action');
const TwitchEmbed = require('@utils/embeds/twitch');
// -----------------------------------

module.exports = {
    name: 'live',
    group: 'Twitch',
    description: 'Send live stream announcement.',
    ephemeral: true,

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

        const command = int.options.getSubcommand();

        if (command == 'setup') {
            const username = int.options.getString('username');
            const channel = await client.twitch.getUserByUserName(username);

            if (!channel) return int.editReply({ embeds: [new ActionEmbed('fail', 'Invalid twich user provided!', int.user)] });

            const announce = int.options.getChannel('channel');

            if (!announce) return int.editReply({ embeds: [new ActionEmbed('fail', 'Invalid channel provided!', int.user)] });

            await client.database.set(int.guildId, 'twitch', { 'user': username, 'channels': [announce.id] });
            if (client.twitch) await client.twitch.registerListeners();

            const success = new ActionEmbed('success', 'Setup complete!', int.user);
            success.setTitle('Twitch Setup');
            success.addFields([
                { name: 'User', value: `[${username}](https://twitch.tv/${username})` },
                { name: 'Channel', value: `\`#${announce.name}\`` }
            ]);

            return int.editReply({ embeds: [success] });
        }

        if (command == 'send') {
            await int.editReply({ embeds: [new ActionEmbed('load', 'Searching...', int.user)] });

            const info = await client.database.get(int.guildId, 'twitch');

            if (!info) return int.editReply({ embeds: [new ActionEmbed('fail', 'You have not completed the setup. Try running the command: `/live setup`', int.user)] });

            const stream = await client.twitch.getStreamByUserName(info.user);

            if (!stream) return int.editReply({ embeds: [new ActionEmbed('fail', 'User is not streaming!', int.user)] });

            const user = await stream.getUser();
            const image = await stream.getThumbnailUrl(1280, 720);

            const embed = new TwitchEmbed(user, stream, image);

            for (const channelId of info.channels) {
                try {
                    const channel = await int.guild.channels.fetch(channelId);
                    if (channel) channel.send({ content: "@everyone", embeds: [embed] });
                } catch (err) {
                    console.error(`Guild Commands (ERROR) (${int.guild.id}) >> live: Failed To Fetch Channel`.red);
                    console.error(err);
                    
                    client.logger?.error(err);

                    return int.editReply({ embeds: [new ActionEmbed('fail', 'Failed to send message(s)! Are you sure I have enough permissions? Try running the setup again if this message keeps appearing.', int.user)] });
                }
            }

            return int.editReply({ embeds: [new ActionEmbed('success', 'Message(s) sent!', int.user)] });
        }
    }
};