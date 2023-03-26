import { Command } from "../../../structures/index.js";
import { SlashCommandBuilder } from "discord.js";
import { ActionEmbed, MusicEmbed } from "../../../utils/embeds/index.js";
export class QueueCommand extends Command {
    constructor(commander) {
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
            .setDescription(this.description?.content)
            .setDMPermission(false);
    }
    async execute(client, int) {
        const subscription = client.subscriptions.get(int.guildId);
        if (!subscription || !subscription.active && !subscription.queue.length)
            return int.editReply({ embeds: [new ActionEmbed("fail").setUser(int.user).setDesc("The queue is empty or does not exist!")] });
        return await int.editReply({ embeds: [new MusicEmbed(subscription).setUser(int.user).setPlaying(subscription.active).setQueue(subscription.queue)] });
    }
}
