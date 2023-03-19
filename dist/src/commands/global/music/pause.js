import { Command } from "../../../structures/index.js";
import { SlashCommandBuilder } from "discord.js";
import { MusicEmbed, ErrorEmbed } from "../../../utils/embeds/index.js";
import chalk from "chalk";
export class PauseCommand extends Command {
    constructor(commander) {
        super(commander);
        this.name = "pause";
        this.group = "Music";
        this.description = {
            content: "Pause the track. Use \`/play\` to unpause.",
        };
        this.cooldown = 5;
    }
    data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description?.content)
            .setDMPermission(false);
    }
    async execute(client, int) {
        const subscription = client.subscriptions.get(int.guildId);
        if (!subscription)
            return await int.editReply({ embeds: [new MusicEmbed(int).setTitle("I'm not playing anything!")] });
        try {
            subscription.destroy();
            return await int.editReply({ embeds: [new MusicEmbed(int).setTitle(subscription.isPlayerPaused() ? "👋 \u200b Discconected! Cya!" : "👋 \u200b Stopped playing! Cya!")] });
        }
        catch (err) {
            const eventId = client.logger.error(err);
            console.error(chalk.red("Music Commands (ERROR) >> pause: Error Running Command"));
            console.error(err);
            return await int.editReply({ embeds: [new ErrorEmbed(eventId)] });
        }
    }
}
