import { Event, KATClient as Client, Commander, Subscription as MusicSubscription } from "@structures/index.js";

export class PlayerEnd extends Event {
    constructor(client: Client, commander: Commander) {
        super(client, commander, "nodeDisconnect");
    }

    async execute(subscription: MusicSubscription) {
        subscription.active?.onFinish();
        subscription.active = null;
        subscription.process();
    }
}
