!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="93cf0979-ba70-5e4f-a397-8531760e7221")}catch(e){}}();
import { Command, MusicPrompts } from '../../structures/index.js';
import { ActionEmbed, ReviewEmbed } from '../../utils/embeds/index.js';
export class StopCommand extends Command {
    constructor(client, commander) {
        super(client, commander, {
            name: 'stop',
            module: 'Music',
            // Remove when shifting to slash commands.
            aliases: ['dc'],
            description: {
                content: 'Clear the queue and/or leave.',
            },
            cooldown: 5,
            ephemeral: true,
        });
    }
    async execute(int) {
        const subscription = this.client.dispatcher.getSubscription(int.guild);
        if (!subscription)
            return int.editReply({ embeds: [new ActionEmbed('fail').setText(MusicPrompts.NotPlaying)] });
        subscription.destroy();
        const reviewEmbed = new ReviewEmbed();
        int.editReply({ content: '👋 \u200b • \u200b Disconnected, Cya.', embeds: [reviewEmbed], components: [reviewEmbed.row] });
    }
}
//# debugId=93cf0979-ba70-5e4f-a397-8531760e7221
//# sourceMappingURL=stop.js.map
