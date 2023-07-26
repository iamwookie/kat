import { Command, KATClient as Client, Commander, MusicPrompts } from '@structures/index.js';
import { ChatInputCommandInteraction } from 'discord.js';
import { ActionEmbed } from '@utils/embeds/index.js';

export class SkipCommand extends Command {
    constructor(client: Client, commander: Commander) {
        super(client, commander, {
            name: 'skip',
            module: 'Music',
            description: {
                content: 'Skip the track.',
            },
            cooldown: 5,
            ephemeral: true,
        });
    }

    async execute(int: ChatInputCommandInteraction<'cached'>) {
        const subscription = this.client.dispatcher.getSubscription(int.guild);
        if (!subscription || !subscription.active || subscription.paused)
            return int.editReply({ embeds: [new ActionEmbed('fail').setText(MusicPrompts.QueueEmpty)] });
        if (!subscription.voiceChannel.members.has(int.user.id))
            return int.editReply({ embeds: [new ActionEmbed('fail').setText(MusicPrompts.NotInMyVoice)] });
        if (subscription.queue.length == 0) return int.editReply({ embeds: [new ActionEmbed('fail').setText(MusicPrompts.LastTrack)] });

        this.applyCooldown(int.user);

        subscription.stop();

        int.editReply({ content: '⏭️ \u200b • \u200b Track Skipped.' })
    }
}
