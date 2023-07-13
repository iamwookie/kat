import { Event, KATClient as Client, Commander, Events, Subscription } from '@structures/index.js';
import { MusicEmbed } from '@utils/embeds/index.js';

export class PlayerLoop extends Event {
    constructor(client: Client, commander: Commander) {
        super(client, commander, Events.PlayerLoop);
    }

    async execute(subscription: Subscription) {
        if (subscription.message?.editable)
            subscription.message.edit({ embeds: [new MusicEmbed(subscription).setPlaying(subscription.active)] }).catch(() => {});
    }
}
