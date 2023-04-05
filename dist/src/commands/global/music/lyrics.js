import { Command } from "../../../structures/index.js";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { ActionEmbed } from "../../../utils/embeds/index.js";
import GeniusLyrics from "genius-lyrics";
const genius = new GeniusLyrics.Client(process.env.GENIUS_API_KEY);
export class LyricsCommand extends Command {
    constructor(commander) {
        super(commander);
        this.name = "lyrics";
        this.group = "Music";
        this.description = {
            content: "View the current tracks lyrics or search for one.",
            format: "<?title/url>",
        };
        this.cooldown = 5;
    }
    data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description?.content)
            .setDMPermission(false)
            .addStringOption((option) => {
            option.setName("query")
                .setDescription("The name or URL of the track to search for.")
                .setRequired(false);
            return option;
        });
    }
    async execute(client, int) {
        const author = this.getAuthor(int);
        let query = this.getArgs(int).join(" ");
        const subscription = client.subscriptions.get(int.guildId);
        if (!query && subscription && subscription.active)
            query = subscription.active.title;
        if (!query)
            return this.reply(int, { embeds: [new ActionEmbed("fail").setDesc("I am not playing anything!")] });
        this.applyCooldown(author);
        const noResults = new ActionEmbed("fail").setDesc("Couldn't find your search results!");
        try {
            const search = await genius.songs.search(query);
            let lyrics = search[0] ? await search[0].lyrics() : null;
            if (!lyrics)
                return this.reply(int, { embeds: [noResults] });
            if (lyrics.length > 4000)
                lyrics = lyrics.substring(0, 4000) + "\n...";
            const success = new EmbedBuilder();
            success.setDescription(`**Track: ${search[0].title} - ${search[0].artist.name}**\n\`\`\`${lyrics}\`\`\`\n**Lyrics provided by [Genius](https://genius.com)**`);
            this.reply(int, { embeds: [success] });
        }
        catch (err) {
            client.logger.error(err);
            this.reply(int, { embeds: [noResults] });
        }
    }
}
