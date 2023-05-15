import { KATClient as Client, Commander, Command } from '@structures/index.js';
import { ChatInputCommandInteraction, Message } from 'discord.js';
import { MusicEmbed, ActionEmbed } from '@utils/embeds/index.js';
import { MusicPrompts } from 'enums.js';

export class LoopCommand extends Command {
    constructor(client: Client, commander: Commander) {
        super(client, commander, {
            name: 'loop',
            aliases: ['repeat'],
            module: 'Music',
            legacy: true,
            description: {
                content: 'Loop the currently playing track.',
            },
        });
    }

    async execute(int: ChatInputCommandInteraction<'cached'> | Message<true>) {
        const author = this.commander.getAuthor(int);

        const subscription = this.client.subscriptions.get(int.guildId!);
        if (!subscription || !subscription.active)
            return this.commander.reply(int, { embeds: [new ActionEmbed('fail').setText(MusicPrompts.NotPlaying)] });
        if (!subscription.voiceChannel.members.has(author.id))
            return this.commander.reply(int, { embeds: [new ActionEmbed('fail').setText(MusicPrompts.NotInMyVoice)] });

        subscription.loop();
        this.commander.reply(int, { embeds: [new MusicEmbed(subscription).setLooped(subscription.active)] });
    }
}
