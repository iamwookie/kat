!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="4ec6a6ad-113e-57af-8cca-a98d7ca27501")}catch(e){}}();
import { Event } from '../../../structures/index.js';
import { ActionEmbed } from '../../../utils/embeds/index.js';
import { MusicPrompts } from '../../../structures/interfaces/Enums.js';
export class PlayerEnd extends Event {
    constructor(client, commander) {
        super(client, commander, 'playerEnd');
    }
    async execute(subscription) {
        if (subscription.message?.deletable)
            subscription.message.delete().catch(() => { });
        if (!subscription.looped)
            subscription.active = null;
        subscription.process();
        setTimeout(async () => {
            if (!subscription.destroyed && !subscription.active && !subscription.queue.length) {
                subscription.textChannel.send({ embeds: [new ActionEmbed('warn').setText(MusicPrompts.Inactive)] }).catch(() => { });
                subscription.destroy();
            }
        }, this.client.config.music.inactiveDuration);
    }
}
//# debugId=4ec6a6ad-113e-57af-8cca-a98d7ca27501
//# sourceMappingURL=PlayerEnd.js.map
