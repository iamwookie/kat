import { Event, KATClient as Client, Commander, Events, Subscription } from '@structures/index.js';
import { MusicEmbed } from '@utils/embeds/index.js';

export class PlayerPause extends Event {
    constructor(client: Client, commander: Commander) {
        super(client, commander, Events.PlayerPause);
    }

    async execute(subscription: Subscription) {
        if (subscription.message?.editable)
            subscription.message.edit({ embeds: [new MusicEmbed(subscription).setColor('Yellow').setPlaying(subscription.active)] }).catch(() => {});
    }
}
