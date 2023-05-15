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
        const author = this.commander.getAuthor(int);
        const subscription = this.client.subscriptions.get(int.guildId);
        if (!subscription || !subscription.active || subscription.paused)
            return this.commander.reply(int, { embeds: [new ActionEmbed('fail').setText(MusicPrompts.QueueEmpty)] });
        if (!subscription.voiceChannel.members.has(author.id))
            return this.commander.reply(int, { embeds: [new ActionEmbed('fail').setText(MusicPrompts.NotInMyVoice)] });
        if (subscription.queue.length == 0)
            return this.commander.reply(int, { embeds: [new ActionEmbed('fail').setText(MusicPrompts.LastTrack)] });
        this.applyCooldown(author);
        subscription.stop();
        this.commander.reply(int, {
            embeds: [
                new ActionEmbed('success').setText('Skipping...'),
                new MusicEmbed(subscription).setUser(author).setPlaying(subscription.queue[0]),
            ],
        });
    }
}
