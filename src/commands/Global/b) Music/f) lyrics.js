const { SlashCommandBuilder } = require('discord.js');

const GeniusLyrics = require("genius-lyrics");
const genius = new GeniusLyrics.Client(process.env.GENIUS_API_KEY);

const MusicEmbed = require('@utils/embeds/music');
const ActionEmbed = require('@utils/embeds/action');

module.exports = {
    name: 'lyrics',
    group: 'Music',
    description: 'View the currently playing tracks lyrics or search for one.',
    format: '<?search>',
    cooldown: 5,

    // SLASH
    data() {
        return (
            new SlashCommandBuilder()
                .setName(this.name)
                .setDescription(this.description)
                .setDMPermission(false)
                .addStringOption(option => {
                    option.setName('query');
                    option.setDescription('The name of the track.');
                    return option;
                })
        );
    },

    async run(client, int) {
        var query = int.options.getString('query');
        const subscription = client.subscriptions.get(int.guildId);

        if (!query) {
            if (!subscription || !subscription.isPlayerPlaying()) return int.editReply({ embeds: [new ActionEmbed('fail', 'I am not playing anything!', int.user)] });

            query = subscription.active.title;
        }

        try {
            const search = await genius.songs.search(query);

            var lyrics = search[0] ? await search[0].lyrics() : null;
            if (!lyrics) return int.editReply({ embeds: [new ActionEmbed('fail', 'Couldn\'t find your search results!', int.user)] });
            if (lyrics.length > 4000) lyrics = lyrics.substring(0, 4000) + '\n...';

            const success = new MusicEmbed(int).setItem(subscription?.active);
            search[0] ? success.setDescription(`**Track: ${search[0].title} - ${search[0].artist.name}**\n\n\`\`\`${lyrics}\`\`\`\n**Lyrics provided by [Genius](https://genius.com)**`) : success.setDescription(lyrics);

            return int.editReply({ embeds: [success] });
        } catch (err) {
            client.logger?.error(err);
            console.error('Music Commands (ERROR) >> lyrics: Error Getting Track Lyrics'.red);
            console.error(err);

            return int.editReply({ embeds: [new ActionEmbed('fail', 'An error occured. A developer has been notified!', int.user)] });
        }
    }
};