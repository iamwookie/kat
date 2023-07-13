!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="fb263972-6c78-52f8-a1c0-a06c51672386")}catch(e){}}();
import { Command, MusicPrompts } from '../../structures/index.js';
import { ActionEmbed, MusicEmbed } from '../../utils/embeds/index.js';
export class QueueCommand extends Command {
    constructor(client, commander) {
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
    async execute(int) {
        const subscription = this.client.dispatcher.getSubscription(int.guild);
        if (!subscription || (!subscription.active && !subscription.queue.length))
            return int.editReply({ embeds: [new ActionEmbed('fail').setText(MusicPrompts.QueueEmpty)] });
        int.editReply({ embeds: [new MusicEmbed(subscription).setUser(int.user).setPlaying(subscription.active).setQueue(subscription.queue)] });
    }
}
//# debugId=fb263972-6c78-52f8-a1c0-a06c51672386
//# sourceMappingURL=queue.js.map
