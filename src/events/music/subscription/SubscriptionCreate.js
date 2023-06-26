import { Event, Events, MusicPrompts } from '../../../structures/index.js';
import { Events as DiscordEvents } from 'discord.js';
import { ActionEmbed } from '../../../utils/embeds/index.js';
export class SubscriptionCreate extends Event {
    constructor(client, commander) {
        super(client, commander, Events.SubscriptionCreate);
    }
    async execute(subscription) {
        this.client.logger.info(`Subscription Created for ${subscription.guild.name} (${subscription.guild.id}). Node: ${subscription.node.name}`, 'Dispatcher');
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
        this.client.emit(DiscordEvents.Debug, `DATABASE >> Activated Queue And Updated Position For: ${subscription.guild.name} (${subscription.guild.id})`);
        setTimeout(async () => {
            if (!subscription.destroyed && !subscription.active && !subscription.queue.length) {
                subscription.textChannel.send({ embeds: [new ActionEmbed('warn').setText(MusicPrompts.Inactive)] }).catch(() => { });
                subscription.destroy();
            }
        }, this.client.config.music.inactiveDuration);
    }
}
