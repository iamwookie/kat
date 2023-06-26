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
