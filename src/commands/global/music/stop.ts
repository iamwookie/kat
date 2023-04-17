import { KATClient as Client, Commander, Command } from "@structures/index.js";
import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { Subscription as MusicSubscription } from "@structures/music/Subscription.js";
import { ActionEmbed } from "@utils/embeds/index.js";

export class StopCommand extends Command {
    constructor(client: Client, commander: Commander) {
        super(client, commander);

        this.name = "stop";
        this.group = "Music";
        this.aliases = ["dc"];

        this.legacy = true;

        this.description = {
            content: "Clear the queue and/or leave.",
        };

        this.cooldown = 5;
    }

    data() {
        return new SlashCommandBuilder().setName(this.name).setDescription(this.description?.content!).setDMPermission(false);
    }

    async execute(int: ChatInputCommandInteraction) {
        const subscription: MusicSubscription = this.client.subscriptions.get(int.guildId);
        if (!subscription) return this.reply(int, { embeds: [new ActionEmbed("fail").setDesc("I'm not playing anything!")] });

        subscription.destroy();
        return this.reply(int, { embeds: [new ActionEmbed("success").setDesc("Successfully disconnected. Cya! 👋")] });
    }
}
