import { Command } from "../../../structures/index.js";
import { SlashCommandBuilder } from "discord.js";
import { ActionEmbed, ErrorEmbed } from "../../../utils/embeds/index.js";
import chalk from "chalk";
export class StopCommand extends Command {
    constructor(commander) {
        super(commander);
        this.name = "stop";
        this.aliases = ["dc"];
        this.group = "Music";
        this.description = {
            content: "Clear the queue and/or leave.",
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
            return await int.editReply({ embeds: [] });
        try {
            subscription.destroy();
            return await int.editReply({ embeds: [new ActionEmbed("success").setUser(int.user).setDesc("Successfully disconnected. Cya! 👋")] });
        }
        catch (err) {
            const eventId = client.logger.error(err);
            console.error(chalk.red("Music Commands (ERROR) >> stop: Error Running Command"));
            console.error(err);
            return await int.editReply({ embeds: [new ErrorEmbed(eventId)] });
        }
    }
}
