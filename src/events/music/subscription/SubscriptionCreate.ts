import { Event, KATClient as Client, Commander, Subscription as MusicSubscription } from '@structures/index.js';
import { Events } from 'discord.js';
import { ActionEmbed } from '@utils/embeds/index.js';
import { MusicPrompts } from 'enums.js';

export class SubscriptionCreate extends Event {
    constructor(client: Client, commander: Commander) {
        super(client, commander, 'subscriptionCreate');
    }

    async execute(subscription: MusicSubscription) {
        this.client.logger.info(
            `Subscription Created for ${subscription.guild.name} (${subscription.guild.id}). Node: ${subscription.node.name}`,
            'Music'
        );

        await this.client.prisma.queue.upsert({
            where: {
                guildId: subscription.guild.id,
            },
            update: {
                position: subscription.position,
                active: true,
            },
            create: {
                guildId: subscription.guild.id,
                voiceId: subscription.voiceChannel.id,
                textId: subscription.textChannel.id,
                active: true,
            },
        });

        this.client.emit(
            Events.Debug,
            `Music (DATABASE) >> Activated And Updated Queue Position For: ${subscription.guild.name} (${subscription.guild.id})`
        );

        setTimeout(async () => {
            if (!subscription.destroyed && !subscription.active && !subscription.queue.length) {
                subscription.textChannel.send({ embeds: [new ActionEmbed('warn').setText(MusicPrompts.Inactive)]}).catch(() => {});
                subscription.destroy();
            }
        }, this.client.config.music.inactiveDuration);
    }
}
