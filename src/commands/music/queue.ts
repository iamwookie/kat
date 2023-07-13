import { Command, KATClient as Client, Commander, MusicPrompts } from '@structures/index.js';
import { ChatInputCommandInteraction } from 'discord.js';
import { ActionEmbed, MusicEmbed } from '@utils/embeds/index.js';

export class QueueCommand extends Command {
    constructor(client: Client, commander: Commander) {
        super(client, commander, {
            name: 'queue',
            module: 'Music',
            // Remove when shifting to slash commands.
            aliases: ['q'],
            description: {
                content: 'View the server queue.',
            },
            cooldown: 5,
            ephemeral: true,
        });
    }

    async execute(int: ChatInputCommandInteraction<'cached'>) {
        const subscription = this.client.dispatcher.getSubscription(int.guild);
        if (!subscription || (!subscription.active && !subscription.queue.length))
            return int.editReply({ embeds: [new ActionEmbed('fail').setText(MusicPrompts.QueueEmpty)] });

        int.editReply({ embeds: [new MusicEmbed(subscription).setUser(int.user).setPlaying(subscription.active).setQueue(subscription.queue)] });
    }
}
