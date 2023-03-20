import { KATClient as Client, Commander, Command } from "@structures/index.js";

import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { Subscription as MusicSubscription } from "@structures/index.js";
import { ActionEmbed, ErrorEmbed, MusicEmbed } from "@src/utils/embeds/index.js";

import chalk from "chalk";

export class PauseCommand extends Command {
    constructor(commander: Commander) {
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
            .setDescription(this.description?.content!)
            .setDMPermission(false);
    }

    async execute(client: Client, int: ChatInputCommandInteraction) {
        const subscription: MusicSubscription = client.subscriptions.get(int.guildId);

        if (!subscription) return await int.editReply({ embeds: [new ActionEmbed("fail").setUser(int.user).setDesc("I'm not playing anything!")] });

        try {
            subscription.destroy();
            return await int.editReply({ embeds: [new MusicEmbed(int).setTitle(subscription.paused ? "👋 \u200b Discconected! Cya!" : "👋 \u200b Stopped playing! Cya!")] });
        } catch (err) {
            const eventId = client.logger.error(err);
            console.error(chalk.red("Music Commands (ERROR) >> pause: Error Running Command"));
            console.error(err);

            return await int.editReply({ embeds: [new ErrorEmbed(eventId)] });
        }
    }
}
