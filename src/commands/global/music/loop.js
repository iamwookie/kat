!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="ec536735-9d0c-5dec-b8ce-865e45a49ac5")}catch(e){}}();
import { Command, MusicPrompts } from '../../../structures/index.js';
import { ActionEmbed } from '../../../utils/embeds/index.js';
export class LoopCommand extends Command {
    constructor(client, commander) {
        super(client, commander, {
            name: 'loop',
            module: 'Music',
            legacy: true,
            aliases: ['repeat'],
            description: {
                content: 'Loop the currently playing track.',
            },
            ephemeral: true,
        });
    }
    async execute(int) {
        const author = this.commander.getAuthor(int);
        const subscription = this.client.dispatcher.getSubscription(int.guild);
        if (!subscription || !subscription.active)
            return this.commander.reply(int, { embeds: [new ActionEmbed('fail').setText(MusicPrompts.NotPlaying)] });
        if (!subscription.voiceChannel.members.has(author.id))
            return this.commander.reply(int, { embeds: [new ActionEmbed('fail').setText(MusicPrompts.NotInMyVoice)] });
        const looped = subscription.loop();
        this.commander.reply(int, { embeds: [new ActionEmbed('success').setText(looped ? MusicPrompts.TrackLooped : MusicPrompts.TrackUnlooped)] });
    }
}
//# debugId=ec536735-9d0c-5dec-b8ce-865e45a49ac5
//# sourceMappingURL=loop.js.map
