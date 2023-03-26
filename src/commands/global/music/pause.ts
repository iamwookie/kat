import { KATClient as Client, Commander, Command } from "@structures/index.js";
import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { Subscription as MusicSubscription } from "@structures/index.js";
import { ActionEmbed, MusicEmbed } from "@src/utils/embeds/index.js";

export class PauseCommand extends Command {
    constructor(commander: Commander) {
        super(commander);

        this.name = "pause";
        this.group = "Music";
        this.description = {
            content: "Pause the track. Use \`/play\` to unpause.",
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
        if (!subscription || !subscription.active || subscription.paused) return await int.editReply({ embeds: [new ActionEmbed("fail").setUser(int.user).setDesc("I'm not playing anything!")] });

        const embed = new MusicEmbed(subscription).setUser(int.user).setPaused(subscription.active);
        subscription.pause();
        return await int.editReply({ embeds: [embed] });
    }
}
