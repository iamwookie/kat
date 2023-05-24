import { Event, KATClient as Client, Commander, Subscription as MusicSubscription } from '@structures/index.js';
import { Events } from 'discord.js';

export class SubscriptionDestroy extends Event {
    constructor(client: Client, commander: Commander) {
        super(client, commander, 'subscriptionDestroy');
    }

    async execute(subscription: MusicSubscription) {
        this.client.logger.warn(
            `Subscription Destroyed For: ${subscription.guild.name} (${subscription.guild.id}). Node: ${subscription.node.name}`,
            'Music'
        );

        if (subscription.message?.deletable) await subscription.message.delete().catch(() => {});

        await this.client.prisma.queue.upsert({
            where: {
                guildId: subscription.guild.id,
            },
            update: {
                active: false,
            },
            create: {
                guildId: subscription.guild.id,
                voiceId: subscription.voiceChannel.id,
                textId: subscription.textChannel.id,
            },
        });

        this.client.emit(
            Events.Debug,
            `Music (DATABASE) >> Set Queue To Inactive: ${subscription.guild.name} (${subscription.guild.id})`
        );
    }
}
