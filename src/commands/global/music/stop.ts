import { KATClient as Client, Commander, Command } from "@structures/index.js";

import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { ActionEmbed, ErrorEmbed } from "@src/utils/embeds/index.js";

import chalk from "chalk";

export class StopCommand extends Command {
    constructor(commander: Commander) {
        super(commander);

        this.name = "stop";
        this.group = "Music";
        this.description = {
            content: "Clear the queue and/or leave.",
        };

        this.cooldown = 5;

        this.data = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description.content!)
            .setDMPermission(false);
    }

    async execute(client: Client, int: ChatInputCommandInteraction) {
        const subscription = client.subscriptions.get(int.guildId);
        if (!subscription) return await int.editReply({ embeds: [new ActionEmbed('fail', 'I am not playing anything!', int.user)] });

        try {
            subscription.destroy();

            return await int.editReply({ embeds: [new ActionEmbed('success', 'Successfully disconnected. Cya! 👋', int.user)] });
        } catch (err) {
            const eventId = client.logger.error(err);
            console.error(chalk.red('Music Commands (ERROR) >> stop: Error Running Command'));
            console.error(err);

            return await int.editReply({ embeds: [new ErrorEmbed(eventId)] });
        }
    }
}
