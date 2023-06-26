import { Command, MusicPrompts } from '../../../structures/index.js';
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { ActionEmbed } from '../../../utils/embeds/index.js';
import GeniusLyrics from 'genius-lyrics';
const genius = new GeniusLyrics.Client();
export class LyricsCommand extends Command {
    constructor(client, commander) {
        super(client, commander, {
            name: 'lyrics',
            module: 'Music',
            legacy: true,
            description: {
                content: 'View the current tracks lyrics or search for one.',
                format: '<?title/url>',
            },
        });
    }
    data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description?.content)
            .setDMPermission(false)
            .addStringOption((option) => option.setName('query').setDescription('The name or URL of the track to search for.'));
    }
    async execute(int) {
        const author = this.commander.getAuthor(int);
        let query = this.commander.getArgs(int).join(' ');
        const subscription = this.client.dispatcher.getSubscription(int.guild);
        if (!query && subscription && subscription.active)
            query = subscription.active.title;
        if (!query)
            return this.commander.reply(int, { embeds: [new ActionEmbed('fail').setText(MusicPrompts.NotPlaying)] });
        this.applyCooldown(author);
        const noResults = new ActionEmbed('fail').setText(MusicPrompts.NoResults);
        try {
            const search = await genius.songs.search(query);
            let lyrics = search[0] ? await search[0].lyrics() : null;
            if (!lyrics)
                return this.commander.reply(int, { embeds: [noResults] });
            if (lyrics.length > 4000)
                lyrics = lyrics.substring(0, 4000) + '\n...';
            const success = new EmbedBuilder();
            success.setDescription(`**Track: ${search[0].title} - ${search[0].artist.name}**\n\n\`\`\`${lyrics}\`\`\`\n**Lyrics provided by [Genius](https://genius.com)**`);
            this.commander.reply(int, { embeds: [success] });
        }
        catch (err) {
            this.client.logger.error(err);
            this.commander.reply(int, { embeds: [noResults] });
        }
    }
}
