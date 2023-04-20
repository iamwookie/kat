import { Command } from "../../../structures/index.js";
import { SlashCommandBuilder } from "discord.js";
import { ActionEmbed, MusicEmbed } from "../../../utils/embeds/index.js";
export class PauseCommand extends Command {
    constructor(client, commander) {
        super(client, commander, {
            name: "pause",
            group: "Music",
            legacy: true,
            description: {
                content: "Pause the track. Use `/play` to unpause.",
            },
            cooldown: 5,
        });
    }
    data() {
        return new SlashCommandBuilder().setName(this.name).setDescription(this.description?.content).setDMPermission(false);
    }
    async execute(int) {
        const author = this.getAuthor(int);
        const subscription = this.client.subscriptions.get(int.guildId);
        if (!subscription || !subscription.active || subscription.paused)
            return this.reply(int, { embeds: [new ActionEmbed("fail").setText("I'm not playing anything!")] });
        this.applyCooldown(author);
        const embed = new MusicEmbed(subscription).setUser(author).setPaused(subscription.active);
        subscription.pause();
        this.reply(int, { embeds: [embed] });
    }
}
