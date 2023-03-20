import { Command } from "../../../structures/index.js";
import { SlashCommandBuilder } from "discord.js";
import { ActionEmbed, MusicEmbed, ErrorEmbed } from "../../../utils/embeds/index.js";
import chalk from "chalk";
export class SkipCommand extends Command {
    constructor(commander) {
        super(commander);
        this.name = "skip";
        this.group = "Music";
        this.description = {
            content: "Skip the track.",
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
        if (!subscription || !subscription.playing)
            return int.editReply({ embeds: [new ActionEmbed("fail").setUser(int.user).setDesc("The queue is empty or does not exist!")] });
        if (subscription.queue.length == 0)
            return int.editReply({ embeds: [new ActionEmbed("fail").setUser(int.user).setDesc("Nothing to skip to. This is the last track!")] });
        try {
            subscription.player.stop();
            return await int.editReply({ embeds: [new MusicEmbed(int).setSkipped(subscription)] });
        }
        catch (err) {
            const eventId = client.logger.error(err);
            console.error(chalk.red("Music Commands (ERROR) >> skip: Error Running Command"));
            console.error(err);
            return await int.editReply({ embeds: [new ErrorEmbed(eventId)] });
        }
    }
}
