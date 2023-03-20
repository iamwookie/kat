import { KATClient as Client, Commander, Command } from "@structures/index.js";

import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { Subscription as MusicSubscription } from "@structures/index.js";
import { ActionEmbed, MusicEmbed } from "@src/utils/embeds/index.js";

export class QueueCommand extends Command {
    constructor(commander: Commander) {
        super(commander);

        this.name = "queue";
        this.group = "Music";
        this.description = {
            content: "View the server queue.",
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
        if (!subscription || !subscription.active && !subscription.queue.length) return int.editReply({ embeds: [new ActionEmbed("fail").setUser(int.user).setDesc("The queue is empty or does not exist!")] });

        return await int.editReply({ embeds: [new MusicEmbed(int).setPlaying(subscription).setQueue(subscription)] });
    }
}
