import { Event } from "../../../structures/index.js";
export class PlayerEnd extends Event {
    constructor(client, commander) {
        super(client, commander, "playerEnd");
    }
    async execute(subscription) {
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
