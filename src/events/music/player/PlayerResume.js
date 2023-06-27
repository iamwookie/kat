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