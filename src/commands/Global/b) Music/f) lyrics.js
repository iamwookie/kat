const { SlashCommandBuilder } = require('discord.js');

const Commander = require('@commander');

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
    guildOnly: true,

    // SLASH
    data() {
        return (
            new SlashCommandBuilder()
                .setName(this.name)
                .setDescription(this.description)
                .addStringOption(option => {
                    option.setName('query');
                    option.setDescription('The name of the song.');
                    return option;
                })
        );
    },

    async run(client, int) {
        args = int.options.getString('query');
        let song = '';

        if (!args) {
            const subscription = client.subscriptions.get(int.guildId);

            if (!subscription || !subscription.isPlayerPlaying()) return int.editReply({ embeds: [new MusicEmbed(client, int).setTitle('I\'m not playing anything!')] });

            song = subscription.active.title;
        } else {
            song = args;
        }

        try {
            const reply = await int.editReply({ embeds: [new MusicEmbed(client, int, 'searching')] });
            const search = await genius.songs.search(song);
            
            let lyrics = search[0] ? await search[0].lyrics() : 'Couldn\'t find those lyrics!';

            if (lyrics.length > 4000) lyrics = lyrics.substring(0, 4000) + '...\n\n**NOTE: Lyrics are too long to display.**';

            let success = new MusicEmbed(client, int, 'lyrics');

            search[0] ? success.setDescription(`**Song: ${search[0].artist.name} - ${search[0].title}**\n\n${lyrics}\n\n**Lyrics provided by [Genius](https://genius.com)**`) : success.setTitle(lyrics);

            return reply.edit({ embeds: [success] });
        } catch (err) {
            console.error('Music Commands (ERROR) >> lyrics: Error Getting Track Lyrics'.red);
            console.error(err);
            Commander.handleError(client, err);

            return int.editReply({ embeds: [new ActionEmbed('fail', 'An error occured! A developer has been notified!', int.user)] });
        }
    }
};