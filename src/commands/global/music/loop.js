import { Command } from '../../../structures/index.js';
import { ActionEmbed } from '../../../utils/embeds/index.js';
import { MusicPrompts } from '../../../../enums.js';
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
        const subscription = this.client.subscriptions.get(int.guildId);
        if (!subscription || !subscription.active)
            return this.commander.reply(int, { embeds: [new ActionEmbed('fail').setText(MusicPrompts.NotPlaying)] });
        if (!subscription.voiceChannel.members.has(author.id))
            return this.commander.reply(int, { embeds: [new ActionEmbed('fail').setText(MusicPrompts.NotInMyVoice)] });
        const looped = subscription.loop();
        this.commander.reply(int, { embeds: [new ActionEmbed('success').setText(looped ? MusicPrompts.TrackLooped : MusicPrompts.TrackUnlooped)] });
    }
}
