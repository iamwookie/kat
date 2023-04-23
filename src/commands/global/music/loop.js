import { Command } from "../../../structures/index.js";
import { SlashCommandBuilder } from "discord.js";
import { MusicEmbed, ActionEmbed } from "../../../utils/embeds/index.js";
export class LoopCommand extends Command {
    constructor(client, commander) {
        super(client, commander, {
            name: "loop",
            aliases: ["repeat"],
            module: "Music",
            legacy: true,
            description: {
                content: "Loop the currently playing track.",
            },
        });
    }
    data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description?.content)
            .setDMPermission(false);
    }
    async execute(int) {
        const subscription = this.client.subscriptions.get(int.guildId);
        if (!subscription || !subscription.active)
            return this.reply(int, { embeds: [new ActionEmbed("fail").setText("I'm not playing anything!")] });
        subscription.loop();
        this.reply(int, { embeds: [new MusicEmbed(subscription).setLooped(subscription.active)] });
    }
}
