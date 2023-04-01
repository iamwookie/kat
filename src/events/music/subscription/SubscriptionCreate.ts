import { Event, KATClient as Client, Commander, Subscription as MusicSubscription } from "@structures/index.js";

export class SubscriptionCreate extends Event {
    constructor(client: Client, commander: Commander) {
        super(client, commander, "subscriptionCreate");
    }

    async execute(subscription: MusicSubscription) {
        
    }
}
