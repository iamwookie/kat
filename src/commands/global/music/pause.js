import { Command } from '../../../structures/index.js';
import { ActionEmbed, MusicEmbed } from '../../../utils/embeds/index.js';
import { MusicPrompts } from '../../../../enums.js';
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
        });
    }
    async execute(int) {
        const author = this.commander.getAuthor(int);
        const subscription = this.client.subscriptions.get(int.guildId);
        if (!subscription || !subscription.active || subscription.paused)
            return this.commander.reply(int, { embeds: [new ActionEmbed('fail').setText(MusicPrompts.NotPlaying)] });
        if (!subscription.voiceChannel.members.has(author.id))
            return this.commander.reply(int, {
                embeds: [new ActionEmbed('fail').setText(MusicPrompts.NotInMyVoice)],
            });
        this.applyCooldown(author);
        const embed = new MusicEmbed(subscription).setUser(author).setPaused(subscription.active);
        subscription.pause();
        this.commander.reply(int, { embeds: [embed] });
    }
}
