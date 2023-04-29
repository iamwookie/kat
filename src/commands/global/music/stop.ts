import { KATClient as Client, Commander, Command } from '@structures/index.js';
import { SlashCommandBuilder, ChatInputCommandInteraction, Message } from 'discord.js';
import { ActionEmbed } from '@utils/embeds/index.js';
import { MusicPrompts } from 'enums.js';

export class StopCommand extends Command {
    constructor(client: Client, commander: Commander) {
        super(client, commander, {
            name: 'stop',
            module: 'Music',
            aliases: ['dc'],
            legacy: true,
            description: {
                content: 'Clear the queue and/or leave.',
            },
            cooldown: 5,
        });
    }

    data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description?.content!)
            .setDMPermission(false);
    }

    async execute(int: ChatInputCommandInteraction<"cached" | "raw"> | Message<true>) {
        const subscription = this.client.subscriptions.get(int.guildId!);
        if (!subscription)
            return this.reply(int, { embeds: [new ActionEmbed('fail').setText(MusicPrompts.NotPlaying)] });

        subscription.destroy();
        return this.reply(int, { embeds: [new ActionEmbed('success').setText('Successfully disconnected. Cya! 👋')] });
    }
}
