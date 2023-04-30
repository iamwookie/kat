import { KATClient as Client, Commander, Command } from '@structures/index.js';
import { SlashCommandBuilder, ChatInputCommandInteraction, Message } from 'discord.js';
import { ActionEmbed, MusicEmbed } from '@utils/embeds/index.js';
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
        });
    }

    data() {
        return new SlashCommandBuilder().setName(this.name).setDescription(this.description?.content!).setDMPermission(false);
    }

    async execute(int: ChatInputCommandInteraction<'cached'> | Message<true>) {
        const author = this.getAuthor(int);

        const subscription = this.client.subscriptions.get(int.guildId!);
        if (!subscription || !subscription.active || subscription.paused)
            return this.reply(int, { embeds: [new ActionEmbed('fail').setText(MusicPrompts.QueueEmpty)] });
        if (subscription.queue.length == 0) return this.reply(int, { embeds: [new ActionEmbed('fail').setText(MusicPrompts.LastTrack)] });

        this.applyCooldown(author);

        const previous = subscription.active;
        const next = subscription.queue[0];
        subscription.stop();
        this.reply(int, { embeds: [new MusicEmbed(subscription).setUser(author).setPlaying(next).setSkipped(previous)] });
    }
}
