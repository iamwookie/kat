import { Event, KATClient as Client, Commander, Subscription as MusicSubscription } from '@structures/index.js';
import { ActionEmbed } from '@utils/embeds/index.js';
import { MusicPrompts } from 'enums.js';

export class PlayerEnd extends Event {
    constructor(client: Client, commander: Commander) {
        super(client, commander, 'playerEnd');
    }

    async execute(subscription: MusicSubscription) {
        if (!subscription.looped) subscription.active = null;
        subscription.process();

        setTimeout(async () => {
            if (!subscription.active && !subscription.queue.length) {
                await subscription.textChannel.send({ embeds: [new ActionEmbed('warn').setText(MusicPrompts.Inactive)]}).catch(() => {});
                subscription.destroy();
            }
        }, this.client.config.music.inactiveDuration);
    }
}
