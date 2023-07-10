!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="1d05d987-c344-5d0f-a273-7012849f5f22")}catch(e){}}();
import { Command, MusicPrompts } from '../../structures/index.js';
import { ActionEmbed } from '../../utils/embeds/index.js';
export class PauseCommand extends Command {
    constructor(client, commander) {
        super(client, commander, {
            name: 'pause',
            module: 'Music',
            legacy: true,
            description: {
                content: 'Pause the track. Use `/play` to unpause.',
            },
            cooldown: 5,
            ephemeral: true,
        });
    }
    async execute(int) {
        const author = this.commander.getAuthor(int);
        const subscription = this.client.dispatcher.getSubscription(int.guild);
        if (!subscription || !subscription.active || subscription.paused)
            return this.commander.reply(int, { embeds: [new ActionEmbed('fail').setText(MusicPrompts.NotPlaying)] });
        if (!subscription.voiceChannel.members.has(author.id))
            return this.commander.reply(int, { embeds: [new ActionEmbed('fail').setText(MusicPrompts.NotInMyVoice)] });
        this.applyCooldown(author);
        subscription.pause();
        this.commander.react(int, '⏸️');
    }
}
//# debugId=1d05d987-c344-5d0f-a273-7012849f5f22
//# sourceMappingURL=pause.js.map
