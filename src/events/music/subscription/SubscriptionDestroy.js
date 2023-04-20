import { Event } from "../../../structures/index.js";
export class SubscriptionDestroy extends Event {
    constructor(client, commander) {
        super(client, commander, "subscriptionDestroy");
    }
    async execute(subscription) {
        this.client.logger.warn(`Music >> Subscription Destroyed for ${subscription.guild.name} (${subscription.guild.id}). Node: ${subscription.node.name}`);
        await this.client.prisma.subscription.deleteMany({
            where: {
                guildId: subscription.guild.id,
            },
        });
    }
}
