import { Event, KATClient as Client, Commander, Subscription as MusicSubscription } from '@structures/index.js';

export class SubscriptionCreate extends Event {
    constructor(client: Client, commander: Commander) {
        super(client, commander, 'subscriptionCreate');
    }

    async execute(subscription: MusicSubscription) {
        this.client.logger.info(
            `Subscription Created for ${subscription.guild.name} (${subscription.guild.id}). Node: ${subscription.node.name}`,
            'Music'
        );

        const position = await this.client.prisma.track.count({ where: { guildId: subscription.guild.id } });
        // Controversial, as this may update after the embed is sent
        subscription.position = position;

        await this.client.prisma.queue.upsert({
            where: {
                guildId: subscription.guild.id,
            },
            update: {
                position,
            },
            create: {
                guildId: subscription.guild.id,
                voiceId: subscription.voiceChannel.id,
                textId: subscription.textChannel?.id,
            },
        });

        setTimeout(() => {
            {
                if (!subscription.active && !subscription.queue.length) subscription.destroy();
            }
        }, this.client.config.music.inactiveDuration);
    }
}
