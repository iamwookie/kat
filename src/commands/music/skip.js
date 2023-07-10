!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="d50da204-de63-51bb-9864-fb99bf141d82")}catch(e){}}();
import { Command, MusicPrompts } from '../../structures/index.js';
import { ActionEmbed } from '../../utils/embeds/index.js';
export class SkipCommand extends Command {
    constructor(client, commander) {
        super(client, commander, {
            name: 'skip',
            module: 'Music',
            legacy: true,
            description: {
                content: 'Skip the track.',
            },
            cooldown: 5,
            ephemeral: true,
        });
    }
    async execute(int) {
        const author = this.commander.getAuthor(int);
        const subscription = this.client.dispatcher.getSubscription(int.guild);
        if (!subscription || !subscription.active || subscription.paused)
            return this.commander.reply(int, { embeds: [new ActionEmbed('fail').setText(MusicPrompts.QueueEmpty)] });
        if (!subscription.voiceChannel.members.has(author.id))
            return this.commander.reply(int, { embeds: [new ActionEmbed('fail').setText(MusicPrompts.NotInMyVoice)] });
        if (subscription.queue.length == 0)
            return this.commander.reply(int, { embeds: [new ActionEmbed('fail').setText(MusicPrompts.LastTrack)] });
        this.applyCooldown(author);
        subscription.stop();
        this.commander.react(int, '✅');
    }
}
//# debugId=d50da204-de63-51bb-9864-fb99bf141d82
//# sourceMappingURL=skip.js.map
