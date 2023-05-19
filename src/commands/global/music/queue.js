import { Command } from '../../../structures/index.js';
import { ActionEmbed, MusicEmbed } from '../../../utils/embeds/index.js';
import { MusicPrompts } from '../../../../enums.js';
export class QueueCommand extends Command {
    constructor(client, commander) {
        super(client, commander, {
            name: 'queue',
            module: 'Music',
            legacy: true,
            legacyAliases: ['q'],
            description: {
                content: 'View the server queue.',
            },
            cooldown: 5,
            ephemeral: true,
        });
    }
    async execute(int) {
        const author = this.commander.getAuthor(int);
        const subscription = this.client.subscriptions.get(int.guildId);
        if (!subscription || (!subscription.active && !subscription.queue.length))
            return this.commander.reply(int, { embeds: [new ActionEmbed('fail').setText(MusicPrompts.QueueEmpty)] });
        this.commander.reply(int, {
            embeds: [new MusicEmbed(subscription).setUser(author).setPlaying(subscription.active).setQueue(subscription.queue)],
        });
    }
}
