import { Command } from "../../../structures/index.js";
import { SlashCommandBuilder } from "discord.js";
import { ActionEmbed } from "../../../utils/embeds/index.js";
export class StopCommand extends Command {
    constructor(commander) {
        super(commander);
        this.name = "stop";
        this.group = "Music";
        this.aliases = ["dc"];
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
        const author = this.getAuthor(int);
        const subscription = client.subscriptions.get(int.guildId);
        if (!subscription)
            return this.reply(int, { embeds: [new ActionEmbed("fail").setUser(author).setDesc("I'm not playing anything!")] });
        subscription.destroy();
        return this.reply(int, { embeds: [new ActionEmbed("success").setUser(author).setDesc("Successfully disconnected. Cya! 👋")] });
    }
}
