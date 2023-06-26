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
