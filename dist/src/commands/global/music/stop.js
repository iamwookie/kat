import { Command } from "../../../structures/index.js";
import { SlashCommandBuilder } from "discord.js";
import { ActionEmbed } from "../../../utils/embeds/index.js";
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
            return await int.editReply({ embeds: [new ActionEmbed("fail").setUser(int.user).setDesc("I'm not playing anything!")] });
        subscription.destroy();
        return await int.editReply({ embeds: [new ActionEmbed("success").setUser(int.user).setDesc("Successfully disconnected. Cya! 👋")] });
    }
}
