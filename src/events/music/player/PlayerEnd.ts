import { Event, KATClient as Client, Commander, Subscription as MusicSubscription } from "@structures/index.js";

export class PlayerEnd extends Event {
    constructor(client: Client, commander: Commander) {
        super(client, commander, "playerEnd");
    }

    async execute(subscription: MusicSubscription) {
        subscription.active?.onFinish();
        subscription.active = null;
        subscription.process();

        setTimeout(() => {
            {
                if (!subscription.active && !subscription.queue.length) {
                    subscription.destroy();
                    this.client.logger.warn(`Music >> Subscription Destroyed (Inactivity) for ${subscription.guild.name} (${subscription.guild.id})`);
                }
            }
        }, 15_000);
    }
}
