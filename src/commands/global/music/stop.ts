import { KATClient as Client, Commander, Command } from '@structures/index.js';
import { ChatInputCommandInteraction, Message } from 'discord.js';
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

    async execute(int: ChatInputCommandInteraction<'cached'> | Message<true>) {
        const subscription = this.client.subscriptions.get(int.guildId!);
        if (!subscription) return this.reply(int, { embeds: [new ActionEmbed('fail').setText(MusicPrompts.NotPlaying)] });

        subscription.destroy();
        this.reply(int, { embeds: [new ActionEmbed('success').setText('Successfully disconnected. Cya! 👋')] });
    }
}
