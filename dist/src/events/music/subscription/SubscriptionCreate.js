import { Event } from "../../../structures/index.js";
export class SubscriptionCreate extends Event {
    constructor(client, commander) {
        super(client, commander, "subscriptionCreate");
    }
    async execute(subscription) {
    }
}
