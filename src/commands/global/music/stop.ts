import { KATClient as Client, Commander, Command } from '@structures/index.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, Message } from 'discord.js';
import { ActionEmbed, ReviewEmbed } from '@utils/embeds/index.js';
import { MusicPrompts } from 'enums.js';

export class StopCommand extends Command {
    constructor(client: Client, commander: Commander) {
        super(client, commander, {
            name: 'stop',
            module: 'Music',
            aliases: ['dc'],
            legacy: true,
            description: {
                content: 'Clear the queue and/or leave.',
            },
            cooldown: 5,
            ephemeral: true,
        });
    }

    async execute(int: ChatInputCommandInteraction<'cached'> | Message<true>) {
        const subscription = this.client.subscriptions.get(int.guildId!);
        if (!subscription) return this.commander.reply(int, { embeds: [new ActionEmbed('fail').setText(MusicPrompts.NotPlaying)] });

        const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setURL('https://top.gg/bot/916639727220846592#reviews').setLabel('Leave a review').setStyle(ButtonStyle.Link)
        );

        subscription.destroy();
        this.commander.reply(int, {
            embeds: [new ActionEmbed('success').setText('Stopped playing and disconnected. Cya! 👋'), new ReviewEmbed()],
            components: [buttons],
        });
    }
}
