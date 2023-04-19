import { KATClient as Client, Commander, Command } from "@structures/index.js";
import { SlashCommandBuilder, ChatInputCommandInteraction, Message } from "discord.js";
import { MusicEmbed, ActionEmbed } from "@utils/embeds/index.js";

export class LoopCommand extends Command {
    constructor(client: Client, commander: Commander) {
        super(client, commander);

        this.name = "loop";
        this.aliases = ["repeat"];
        this.group = "Music";

        this.legacy = true;

        this.description = {
            content: "Loop the currently playing track.",
        };
    }

    data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description?.content!)
            .setDMPermission(false);
    }

    async execute(int: ChatInputCommandInteraction | Message) {
        const subscription = this.client.subscriptions.get(int.guildId!);
        if (!subscription || !subscription.active) return this.reply(int, { embeds: [new ActionEmbed("fail").setDesc("I'm not playing anything!")] });

        subscription.loop();
        return this.reply(int, { embeds: [new MusicEmbed(subscription).setLooped(subscription.active)] });
    }
}