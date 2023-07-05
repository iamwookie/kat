!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="80a9489f-7671-5df5-8483-87c8a1785055")}catch(e){}}();
import { Event, Events } from '../../../structures/index.js';
import { MusicEmbed } from '../../../utils/embeds/index.js';
export class PlayerPause extends Event {
    constructor(client, commander) {
        super(client, commander, Events.PlayerPause);
    }
    async execute(subscription) {
        if (subscription.message?.editable)
            subscription.message.edit({ embeds: [new MusicEmbed(subscription).setColor('Yellow').setPlaying(subscription.active)] }).catch(() => { });
    }
}
//# debugId=80a9489f-7671-5df5-8483-87c8a1785055
//# sourceMappingURL=PlayerPause.js.map
