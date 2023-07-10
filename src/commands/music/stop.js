!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="c1c00779-1847-5530-be48-c546588b33d7")}catch(e){}}();
import { Command, MusicPrompts } from '../../structures/index.js';
import { ActionEmbed, ReviewEmbed } from '../../utils/embeds/index.js';
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
        const subscription = this.client.dispatcher.getSubscription(int.guild);
        if (!subscription)
            return this.commander.reply(int, { embeds: [new ActionEmbed('fail').setText(MusicPrompts.NotPlaying)] });
        subscription.destroy();
        this.commander.react(int, '👋');
        if (int.channel) {
            const reviewEmbed = new ReviewEmbed();
            int.channel.send({ embeds: [reviewEmbed], components: [reviewEmbed.row] }).catch(() => { });
        }
    }
}
//# debugId=c1c00779-1847-5530-be48-c546588b33d7
//# sourceMappingURL=stop.js.map
