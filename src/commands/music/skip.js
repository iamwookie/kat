!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="ab1a0069-ba74-599d-9197-570c07b5fca5")}catch(e){}}();
import { Command, MusicPrompts } from '../../structures/index.js';
import { ActionEmbed } from '../../utils/embeds/index.js';
export class SkipCommand extends Command {
    constructor(client, commander) {
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
    async execute(int) {
        const subscription = this.client.dispatcher.getSubscription(int.guild);
        if (!subscription || !subscription.active || subscription.paused)
            return int.editReply({ embeds: [new ActionEmbed('fail').setText(MusicPrompts.QueueEmpty)] });
        if (!subscription.voiceChannel.members.has(int.user.id))
            return int.editReply({ embeds: [new ActionEmbed('fail').setText(MusicPrompts.NotInMyVoice)] });
        if (subscription.queue.length == 0)
            return int.editReply({ embeds: [new ActionEmbed('fail').setText(MusicPrompts.LastTrack)] });
        this.applyCooldown(int.user);
        subscription.stop();
        int.editReply({ content: '⏭️ \u200b • \u200b Track Skipped.' });
    }
}
//# debugId=ab1a0069-ba74-599d-9197-570c07b5fca5
//# sourceMappingURL=skip.js.map
