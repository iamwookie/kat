import { KATClient as Client, Commander, Command } from '@structures/index.js';
import { ChatInputCommandInteraction, Message } from 'discord.js';
import { ActionEmbed } from '@utils/embeds/index.js';
import { MusicPrompts } from 'enums.js';

export class PauseCommand extends Command {
    constructor(client: Client, commander: Commander) {
        super(client, commander, {
            name: 'pause',
            module: 'Music',
            legacy: true,
            description: {
                content: 'Pause the track. Use `/play` to unpause.',
            },
            cooldown: 5,
            ephemeral: true,
        });
    }

    async execute(int: ChatInputCommandInteraction<'cached'> | Message<true>) {
        const author = this.commander.getAuthor(int);

        const subscription = this.client.subscriptions.get(int.guildId!);
        if (!subscription || !subscription.active || subscription.paused)
            return this.commander.reply(int, { embeds: [new ActionEmbed('fail').setText(MusicPrompts.NotPlaying)] });
        if (!subscription.voiceChannel.members.has(author.id))
            return this.commander.reply(int, {
                embeds: [new ActionEmbed('fail').setText(MusicPrompts.NotInMyVoice)],
            });

        this.applyCooldown(author);

        subscription.pause();
        this.commander.reply(int, { embeds: [new ActionEmbed('success').setText(MusicPrompts.TrackPaused)] });
    }
}
