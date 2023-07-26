import { Command, KATClient as Client, Commander, MusicPrompts } from '@structures/index.js';
import { ChatInputCommandInteraction } from 'discord.js';
import { ActionEmbed, ReviewEmbed } from '@utils/embeds/index.js';

export class StopCommand extends Command {
    constructor(client: Client, commander: Commander) {
        super(client, commander, {
            name: 'stop',
            module: 'Music',
            // Remove when shifting to slash commands.
            aliases: ['dc'],
            description: {
                content: 'Clear the queue and/or leave.',
            },
            cooldown: 5,
            ephemeral: true,
        });
    }

    async execute(int: ChatInputCommandInteraction<'cached'>) {
        const subscription = this.client.dispatcher.getSubscription(int.guild);
        if (!subscription) return int.editReply({ embeds: [new ActionEmbed('fail').setText(MusicPrompts.NotPlaying)] });

        subscription.destroy();

        const reviewEmbed = new ReviewEmbed();
        int.editReply({ content: '👋 \u200b • \u200b Disconnected, Cya.', embeds: [reviewEmbed], components: [reviewEmbed.row] })
    }
}
