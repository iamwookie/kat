import { Event, KATClient as Client, Commander, Subscription as MusicSubscription } from "@structures/index.js";

export class PlayerStart extends Event {
    constructor(client: Client, commander: Commander) {
        super(client, commander, "nodeDisconnect");
    }

    async execute(subscription: MusicSubscription) {
        subscription.active?.onStart();
        this.client.logger.info(`Music >> Started Playing in ${subscription.guild.name} (${subscription.guild.id}). Node: ${subscription.node.name}`);
    }
}
