import { Event } from '../../../structures/index.js';
import { Events } from 'discord.js';
export class SubscriptionDestroy extends Event {
    constructor(client, commander) {
        super(client, commander, 'subscriptionDestroy');
    }
    async execute(subscription) {
        this.client.logger.warn(`Subscription Destroyed For: ${subscription.guild.name} (${subscription.guild.id}). Node: ${subscription.node.name}`, 'Music');
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
                textId: subscription.textChannel?.id,
            },
        });
        this.client.emit(Events.Debug, `Music (DATABASE) >> Set Queue To Inactive: ${subscription.guild.name} (${subscription.guild.id})`);
    }
}