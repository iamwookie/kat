import { Command, KATClient as Client, Commander, MusicPrompts } from '@structures/index.js';
import { ChatInputCommandInteraction } from 'discord.js';
import { ActionEmbed } from '@utils/embeds/index.js';

export class PauseCommand extends Command {
    constructor(client: Client, commander: Commander) {
        super(client, commander, {
            name: 'pause',
            module: 'Music',
            description: {
                content: 'Pause the track. Use `/play` to unpause.',
            },
            cooldown: 5,
            ephemeral: true,
        });
    }

    async execute(int: ChatInputCommandInteraction<'cached'>) {
        const subscription = this.client.dispatcher.getSubscription(int.guild);
        if (!subscription || !subscription.active || subscription.paused)
            return int.editReply({ embeds: [new ActionEmbed('fail').setText(MusicPrompts.NotPlaying)] });
        if (!subscription.voiceChannel.members.has(int.user.id))
            return int.editReply({ embeds: [new ActionEmbed('fail').setText(MusicPrompts.NotInMyVoice)] });

        this.applyCooldown(int.user);

        subscription.pause();

        int.editReply({ content: '⏸️ \u200b • \u200b Paused the track.' })
    }
}
