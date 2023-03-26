import { KATClient as Client, Commander, Command } from "@structures/index.js";
import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { Subscription as MusicSubscription } from "@src/structures/music/Subscription.js";
import { ActionEmbed, MusicEmbed } from "@src/utils/embeds/index.js";

export class SkipCommand extends Command {
    constructor(commander: Commander) {
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
            .setDescription(this.description?.content!)
            .setDMPermission(false);
    }

    async execute(client: Client, int: ChatInputCommandInteraction) {
        const subscription: MusicSubscription = client.subscriptions.get(int.guildId);
        if (!subscription || !subscription.active || subscription.paused) return int.editReply({ embeds: [new ActionEmbed("fail").setUser(int.user).setDesc("The queue is empty or does not exist!")] });
        if (subscription.queue.length == 0) return int.editReply({ embeds: [new ActionEmbed("fail").setUser(int.user).setDesc("This is the last track in the queue!")] });

        const embed = new MusicEmbed(subscription).setUser(int.user).setSkipped(subscription.active);
        subscription.stop();
        return await int.editReply({ embeds: [embed] });
    }
}

// START FULL OVERHAUL OF MUSIC NOW
