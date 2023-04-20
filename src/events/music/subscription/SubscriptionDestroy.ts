import { Event, KATClient as Client, Commander, Subscription as MusicSubscription } from "@structures/index.js";

export class SubscriptionDestroy extends Event {
    constructor(client: Client, commander: Commander) {
        super(client, commander, "subscriptionDestroy");
    }

    async execute(subscription: MusicSubscription) {
        this.client.logger.warn(`Music >> Subscription Destroyed for ${subscription.guild.name} (${subscription.guild.id}). Node: ${subscription.node.name}`);

        await this.client.prisma.subscription.deleteMany({
            where: {
                guildId: subscription.guild.id,
            },
        });
    }
}
