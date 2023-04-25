import { Event, KATClient as Client, Commander, Subscription as MusicSubscription } from '@structures/index.js';

export class PlayerEnd extends Event {
    constructor(client: Client, commander: Commander) {
        super(client, commander, 'playerEnd');
    }

    async execute(subscription: MusicSubscription) {
        subscription.active?.onFinish();
        if (!subscription.looped) subscription.active = null;
        subscription.process();

        setTimeout(() => {
            {
                if (!subscription.active && !subscription.queue.length) {
                    subscription.destroy();
                    this.client.logger.warn(
                        `Subscription Destroyed (Inactivity) For: ${subscription.guild.name} (${subscription.guild.id})`,
                        'Music'
                    );
                }
            }
        }, this.client.config.music.inactiveDuration);
    }
}
