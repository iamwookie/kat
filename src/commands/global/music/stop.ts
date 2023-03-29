import { KATClient as Client, Commander, Command } from "@structures/index.js";
import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { Subscription as MusicSubscription } from "@src/structures/music/Subscription.js";
import { ActionEmbed } from "@src/utils/embeds/index.js";

export class StopCommand extends Command {
    constructor(commander: Commander) {
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
            .setDescription(this.description?.content!)
            .setDMPermission(false);
    }

    async execute(client: Client, int: ChatInputCommandInteraction) {
        const author = this.getAuthor(int)!;

        const subscription: MusicSubscription = client.subscriptions.get(int.guildId);
        if (!subscription) return this.reply(int, { embeds: [new ActionEmbed("fail").setUser(author).setDesc("I'm not playing anything!")] });

        subscription.destroy();
        return this.reply(int, { embeds: [new ActionEmbed("success").setUser(author).setDesc("Successfully disconnected. Cya! 👋")] });
    }
}
