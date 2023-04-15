import { Command } from "../../../structures/index.js";
import { SlashCommandBuilder } from "discord.js";
import { ActionEmbed, MusicEmbed } from "../../../utils/embeds/index.js";
export class QueueCommand extends Command {
    constructor(client, commander) {
        super(client, commander);
        this.name = "queue";
        this.group = "Music";
        this.legacy = true;
        this.legacyAliases = ["q"];
        this.description = {
            content: "View the server queue.",
        };
    }
    data() {
        return new SlashCommandBuilder().setName(this.name).setDescription(this.description?.content).setDMPermission(false);
    }
    async execute(int) {
        const author = this.getAuthor(int);
        const subscription = this.client.subscriptions.get(int.guildId);
        if (!subscription || (!subscription.active && !subscription.queue.length))
            return this.reply(int, { embeds: [new ActionEmbed("fail").setDesc("The queue is empty or does not exist!")] });
        return this.reply(int, { embeds: [new MusicEmbed(subscription).setUser(author).setPlaying(subscription.active).setQueue(subscription.queue)] });
    }
}
