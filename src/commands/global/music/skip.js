import { Command } from '../../../structures/index.js';
import { ActionEmbed, MusicEmbed } from '../../../utils/embeds/index.js';
import { MusicPrompts } from '../../../../enums.js';
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
        });
    }
    async execute(int) {
        const author = this.getAuthor(int);
        const subscription = this.client.subscriptions.get(int.guildId);
        if (!subscription || !subscription.active || subscription.paused)
            return this.reply(int, { embeds: [new ActionEmbed('fail').setText(MusicPrompts.QueueEmpty)] });
        if (subscription.queue.length == 0)
            return this.reply(int, { embeds: [new ActionEmbed('fail').setText(MusicPrompts.LastTrack)] });
        this.applyCooldown(author);
        const skipped = subscription.active;
        subscription.stop();
        this.reply(int, { embeds: [new MusicEmbed(subscription).setUser(author).setSkipped(skipped)] });
    }
}