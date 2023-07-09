!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="4ebc3d84-30a4-5cfd-ac6f-8eaaffea57ac")}catch(e){}}();
import { Command, MusicPrompts } from '../../../structures/index.js';
import { ActionEmbed, ReviewEmbed } from '../../../utils/embeds/index.js';
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
//# debugId=4ebc3d84-30a4-5cfd-ac6f-8eaaffea57ac
//# sourceMappingURL=stop.js.map
