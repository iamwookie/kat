!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="9c6237f3-d60f-50b7-8d54-f1bc12aad3f1")}catch(e){}}();
import { Event, Events } from '../../../structures/index.js';
import { MusicEmbed } from '../../../utils/embeds/index.js';
export class PlayerResume extends Event {
    constructor(client, commander) {
        super(client, commander, Events.PlayerResume);
    }
    async execute(subscription) {
        if (subscription.message?.editable)
            subscription.message.edit({ embeds: [new MusicEmbed(subscription).setPlaying(subscription.active)] }).catch(() => { });
    }
}
//# debugId=9c6237f3-d60f-50b7-8d54-f1bc12aad3f1
//# sourceMappingURL=PlayerResume.js.map
