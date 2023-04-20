import { Command } from "../../../structures/index.js";
import { SlashCommandBuilder } from "discord.js";
import { ActionEmbed } from "../../../utils/embeds/index.js";
export class StopCommand extends Command {
    constructor(client, commander) {
        super(client, commander, {
            name: "stop",
            group: "Music",
            aliases: ["dc"],
            legacy: true,
            description: {
                content: "Clear the queue and/or leave.",
            },
            cooldown: 5,
        });
    }
    data() {
        return new SlashCommandBuilder().setName(this.name).setDescription(this.description?.content).setDMPermission(false);
    }
    async execute(int) {
        const subscription = this.client.subscriptions.get(int.guildId);
        if (!subscription)
            return this.reply(int, { embeds: [new ActionEmbed("fail").setDesc("I'm not playing anything!")] });
        subscription.destroy();
        return this.reply(int, { embeds: [new ActionEmbed("success").setDesc("Successfully disconnected. Cya! 👋")] });
    }
}
