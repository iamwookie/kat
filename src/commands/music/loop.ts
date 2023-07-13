import { Command, KATClient as Client, Commander, MusicPrompts } from '@structures/index.js';
import { ChatInputCommandInteraction, Message } from 'discord.js';
import { ActionEmbed } from '@utils/embeds/index.js';

export class LoopCommand extends Command {
    constructor(client: Client, commander: Commander) {
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

    async execute(int: ChatInputCommandInteraction<'cached'> | Message<true>) {
        const author = this.commander.getAuthor(int);

        const subscription = this.client.dispatcher.getSubscription(int.guild);
        if (!subscription || !subscription.active) return this.commander.reply(int, { embeds: [new ActionEmbed('fail').setText(MusicPrompts.NotPlaying)] });
        if (!subscription.voiceChannel.members.has(author.id))
            return this.commander.reply(int, { embeds: [new ActionEmbed('fail').setText(MusicPrompts.NotInMyVoice)] });

        const looped = subscription.loop();
        this.commander.reply(int, { embeds: [new ActionEmbed('success').setText(looped ? MusicPrompts.TrackLooped : MusicPrompts.TrackUnlooped)] });
    }
}
