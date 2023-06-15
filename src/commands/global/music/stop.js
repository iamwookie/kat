import { Command } from '../../../structures/index.js';
import { ChatInputCommandInteraction, Message } from 'discord.js';
import { ActionEmbed, ReviewEmbed } from '../../../utils/embeds/index.js';
import { MusicPrompts } from '../../../../enums.js';
export class StopCommand extends Command {
    constructor(client, commander) {
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
    async execute(int) {
        const subscription = this.client.subscriptions.get(int.guildId);
        if (!subscription)
            return this.commander.reply(int, { embeds: [new ActionEmbed('fail').setText(MusicPrompts.NotPlaying)] });
        subscription.destroy();
        const reviewEmbed = new ReviewEmbed();
        if (int instanceof Message)
            int.react('👋');
        this.commander.reply(int, {
            content: int instanceof ChatInputCommandInteraction ? '👋' : '',
            embeds: [reviewEmbed],
            components: [reviewEmbed.row],
        });
    }
}
