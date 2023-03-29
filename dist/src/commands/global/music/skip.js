import { Command } from "../../../structures/index.js";
import { SlashCommandBuilder } from "discord.js";
import { ActionEmbed, MusicEmbed } from "../../../utils/embeds/index.js";
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
        const author = this.getAuthor(int);
        const subscription = client.subscriptions.get(int.guildId);
        if (!subscription || !subscription.active || subscription.paused)
            return this.reply(int, { embeds: [new ActionEmbed("fail").setUser(author).setDesc("The queue is empty or does not exist!")] });
        if (subscription.queue.length == 0)
            return this.reply(int, { embeds: [new ActionEmbed("fail").setUser(author).setDesc("This is the last track in the queue!")] });
        this.applyCooldown(author);
        const embed = new MusicEmbed(subscription).setUser(author).setSkipped(subscription.active);
        subscription.stop();
        return this.reply(int, { embeds: [embed] });
    }
}
// START FULL OVERHAUL OF MUSIC NOW
