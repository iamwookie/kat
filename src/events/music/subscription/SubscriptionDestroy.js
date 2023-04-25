import { Event } from '../../../structures/index.js';
export class SubscriptionDestroy extends Event {
    constructor(client, commander) {
        super(client, commander, 'subscriptionDestroy');
    }
    async execute(subscription) {
        this.client.logger.warn(`Subscription Destroyed For: ${subscription.guild.name} (${subscription.guild.id}). Node: ${subscription.node.name}`, 'Music');
    }
}
