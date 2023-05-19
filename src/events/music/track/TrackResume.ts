import { Event, KATClient as Client, Commander, Subscription as MusicSubscription } from '@structures/index.js';
import { MusicEmbed } from '@utils/embeds/index.js';

export class TrackResume extends Event {
    constructor(client: Client, commander: Commander) {
        super(client, commander, 'trackResume');
    }

    async execute(subscription: MusicSubscription) {
        if (subscription.message?.editable)
            await subscription.message.edit({ embeds: [new MusicEmbed(subscription).setColor('White').setPlaying(subscription.active)] });
    }
}
