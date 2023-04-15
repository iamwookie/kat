import { KATClient as Client, Commander, Command } from "@structures/index.js";
import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { Subscription as MusicSubscription } from "@structures/index.js";
import { ActionEmbed, MusicEmbed } from "@utils/embeds/index.js";

export class PauseCommand extends Command {
    constructor(client: Client, commander: Commander) {
        super(client, commander);

        this.name = "pause";
        this.group = "Music";
        this.legacy = true;

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

    async execute(int: ChatInputCommandInteraction) {
        const author = this.getAuthor(int)!;

        const subscription: MusicSubscription = this.client.subscriptions.get(int.guildId);
        if (!subscription || !subscription.active || subscription.paused) return this.reply(int, { embeds: [new ActionEmbed("fail").setDesc("I'm not playing anything!")] });
        
        this.applyCooldown(author);

        const embed = new MusicEmbed(subscription).setUser(author).setPaused(subscription.active);
        subscription.pause();
        return this.reply(int, { embeds: [embed] });
    }
}
