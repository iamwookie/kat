!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="9c0e0ae9-ffc4-58d8-a51f-b21124454875")}catch(e){}}();
import { Command, MusicPrompts } from '../../structures/index.js';
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { ActionEmbed } from '../../utils/embeds/index.js';
import GeniusLyrics from 'genius-lyrics';
const genius = new GeniusLyrics.Client();
export class LyricsCommand extends Command {
    constructor(client, commander) {
        super(client, commander, {
            name: 'lyrics',
            module: 'Music',
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
        let query = int.options.getString('query');
        const subscription = this.client.dispatcher.getSubscription(int.guild);
        if (!query && subscription && subscription.active)
            query = subscription.active.title;
        if (!query)
            return int.editReply({ embeds: [new ActionEmbed('fail').setText(MusicPrompts.NotPlaying)] });
        this.applyCooldown(int.user);
        const noResults = new ActionEmbed('fail').setText(MusicPrompts.NoResults);
        try {
            const search = await genius.songs.search(query);
            let lyrics = search[0] ? await search[0].lyrics() : null;
            if (!lyrics)
                return int.editReply({ embeds: [noResults] });
            if (lyrics.length > 4000)
                lyrics = lyrics.substring(0, 4000) + '\n...';
            const success = new EmbedBuilder();
            success.setDescription(`**Track: ${search[0].title} - ${search[0].artist.name}**\n\n\`\`\`${lyrics}\`\`\`\n**Lyrics provided by [Genius](https://genius.com)**`);
            int.editReply({ embeds: [success] });
        }
        catch (err) {
            this.client.logger.error(err);
            int.editReply({ embeds: [noResults] });
        }
    }
}
//# debugId=9c0e0ae9-ffc4-58d8-a51f-b21124454875
//# sourceMappingURL=lyrics.js.map
