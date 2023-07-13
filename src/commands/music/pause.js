!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="5bf5c36c-1bf4-5193-ac20-007d96296316")}catch(e){}}();
import { Command, MusicPrompts } from '../../structures/index.js';
import { ActionEmbed } from '../../utils/embeds/index.js';
export class PauseCommand extends Command {
    constructor(client, commander) {
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
    async execute(int) {
        const subscription = this.client.dispatcher.getSubscription(int.guild);
        if (!subscription || !subscription.active || subscription.paused)
            return int.editReply({ embeds: [new ActionEmbed('fail').setText(MusicPrompts.NotPlaying)] });
        if (!subscription.voiceChannel.members.has(int.user.id))
            return int.editReply({ embeds: [new ActionEmbed('fail').setText(MusicPrompts.NotInMyVoice)] });
        this.applyCooldown(int.user);
        subscription.pause();
        int.editReply({ content: '⏸️ \u200b • \u200b Paused the track.' });
    }
}
//# debugId=5bf5c36c-1bf4-5193-ac20-007d96296316
//# sourceMappingURL=pause.js.map
