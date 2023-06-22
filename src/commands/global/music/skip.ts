import { KATClient as Client, Commander, Command } from '@structures/index.js';
import { ChatInputCommandInteraction, Message } from 'discord.js';
import { ActionEmbed } from '@utils/embeds/index.js';
import { MusicPrompts } from 'enums.js';

export class SkipCommand extends Command {
    constructor(client: Client, commander: Commander) {
        super(client, commander, {
            name: 'skip',
            module: 'Music',
            legacy: true,
            description: {
                content: 'Skip the track.',
            },
            cooldown: 5,
            ephemeral: true,
        });
    }

    async execute(int: ChatInputCommandInteraction<'cached'> | Message<true>) {
        const author = this.commander.getAuthor(int);

        const subscription = this.client.subscriptions.get(int.guildId!);
        if (!subscription || !subscription.active || subscription.paused)
            return this.commander.reply(int, { embeds: [new ActionEmbed('fail').setText(MusicPrompts.QueueEmpty)] });
        if (!subscription.voiceChannel.members.has(author.id))
            return this.commander.reply(int, { embeds: [new ActionEmbed('fail').setText(MusicPrompts.NotInMyVoice)] });
        if (subscription.queue.length == 0) return this.commander.reply(int, { embeds: [new ActionEmbed('fail').setText(MusicPrompts.LastTrack)] });

        this.applyCooldown(author);

        subscription.stop();

        if (int instanceof ChatInputCommandInteraction) {
            this.commander.reply(int, { content: '✅' });
        } else if (int instanceof Message) {
            int.react('✅');
        }
    }
}
