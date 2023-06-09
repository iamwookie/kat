import { Event, KATClient as Client, Commander, Subscription as MusicSubscription } from '@structures/index.js';
import { MusicEmbed } from '@utils/embeds/index.js';

export class TrackPause extends Event {
    constructor(client: Client, commander: Commander) {
        super(client, commander, 'trackPause');
    }

    async execute(subscription: MusicSubscription) {
        if (subscription.message?.editable)
            subscription.message.edit({ embeds: [new MusicEmbed(subscription).setColor('Yellow').setPlaying(subscription.active)] }).catch(() => {});
    }
}
