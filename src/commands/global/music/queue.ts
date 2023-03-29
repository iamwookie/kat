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
    }

    data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description?.content!)
            .setDMPermission(false);
    }

    async execute(client: Client, int: ChatInputCommandInteraction) {
        const author = this.getAuthor(int)!;

        const subscription: MusicSubscription = client.subscriptions.get(int.guildId);
        if (!subscription || !subscription.active && !subscription.queue.length) return int.editReply({ embeds: [new ActionEmbed("fail").setUser(author).setDesc("The queue is empty or does not exist!")] });

        return this.reply(int, { embeds: [new MusicEmbed(subscription).setUser(author).setPlaying(subscription.active).setQueue(subscription.queue)] });
    }
}
