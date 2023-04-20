import { Event, KATClient as Client, Commander, Subscription as MusicSubscription } from "@structures/index.js";

export class SubscriptionCreate extends Event {
    constructor(client: Client, commander: Commander) {
        super(client, commander, "subscriptionCreate");
    }

    async execute(subscription: MusicSubscription) {
        this.client.logger.info(`Music >> Subscription Created for ${subscription.guild.name} (${subscription.guild.id}). Node: ${subscription.node.name}`);
 
        await this.client.prisma.subscription.upsert({
            where: {
                guildId: subscription.guild.id,
            },
            update: {
                voiceId: subscription.voiceChannel.id,
                textId: subscription.textChannel?.id,
            },
            create: {
                guildId: subscription.guild.id,
                voiceId: subscription.voiceChannel.id,
                textId: subscription.textChannel?.id,
            },
        });

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
