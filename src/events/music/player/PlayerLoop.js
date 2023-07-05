!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="c95bc193-3b67-5b73-8543-1438e8d3ad41")}catch(e){}}();
import { Event, Events } from '../../../structures/index.js';
import { MusicEmbed } from '../../../utils/embeds/index.js';
export class PlayerLoop extends Event {
    constructor(client, commander) {
        super(client, commander, Events.PlayerLoop);
    }
    async execute(subscription) {
        if (subscription.message?.editable)
            subscription.message.edit({ embeds: [new MusicEmbed(subscription).setPlaying(subscription.active)] }).catch(() => { });
    }
}
//# debugId=c95bc193-3b67-5b73-8543-1438e8d3ad41
//# sourceMappingURL=PlayerLoop.js.map
