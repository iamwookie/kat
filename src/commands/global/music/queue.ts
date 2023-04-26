import { KATClient as Client, Commander, Command } from '@structures/index.js';
import { SlashCommandBuilder, ChatInputCommandInteraction, Message } from 'discord.js';
import { ActionEmbed, MusicEmbed } from '@utils/embeds/index.js';
import { MusicPrompts } from 'enums.js';

export class QueueCommand extends Command {
    constructor(client: Client, commander: Commander) {
        super(client, commander, {
            name: 'queue',
            module: 'Music',
            legacy: true,
            legacyAliases: ['q'],
            description: {
                content: 'View the server queue.',
            },
        });
    }

    data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description?.content!)
            .setDMPermission(false);
    }

    async execute(int: ChatInputCommandInteraction | Message) {
        const author = this.getAuthor(int);

        const subscription = this.client.subscriptions.get(int.guildId!);
        if (!subscription || (!subscription.active && !subscription.queue.length))
            return this.reply(int, { embeds: [new ActionEmbed('fail').setText(MusicPrompts.QueueEmpty)] });

        return this.reply(int, {
            embeds: [
                new MusicEmbed(subscription).setUser(author).setPlaying(subscription.active).setQueue(subscription.queue),
            ],
        });
    }
}
