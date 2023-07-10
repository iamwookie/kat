!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="d5881735-eb73-503e-a153-ec6fd0feed15")}catch(e){}}();
import { Command, MusicPrompts } from '../../structures/index.js';
import { ActionEmbed, MusicEmbed } from '../../utils/embeds/index.js';
export class QueueCommand extends Command {
    constructor(client, commander) {
        super(client, commander, {
            name: 'queue',
            module: 'Music',
            legacy: true,
            aliases: ['q'],
            description: {
                content: 'View the server queue.',
            },
            cooldown: 5,
            ephemeral: true,
        });
    }
    async execute(int) {
        const author = this.commander.getAuthor(int);
        const subscription = this.client.dispatcher.getSubscription(int.guild);
        if (!subscription || (!subscription.active && !subscription.queue.length))
            return this.commander.reply(int, { embeds: [new ActionEmbed('fail').setText(MusicPrompts.QueueEmpty)] });
        this.commander.reply(int, { embeds: [new MusicEmbed(subscription).setUser(author).setPlaying(subscription.active).setQueue(subscription.queue)] });
    }
}
//# debugId=d5881735-eb73-503e-a153-ec6fd0feed15
//# sourceMappingURL=queue.js.map
