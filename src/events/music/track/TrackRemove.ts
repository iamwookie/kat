import { Event, KATClient as Client, Commander, Events, Subscription } from '@structures/index.js';
import { Events as DiscordEvents } from 'discord.js';

export class TrackRemove extends Event {
    constructor(client: Client, commander: Commander) {
        super(client, commander, Events.TrackRemove);
    }

    async execute(subscription: Subscription) {
        await this.client.cache.queue.increment(subscription.guild.id);

        await this.client.prisma.queue.upsert({
            where: {
                guildId: subscription.guild.id,
            },
            update: {
                position: {
                    increment: 1,
                },
            },
            create: {
                guildId: subscription.guild.id,
                voiceId: subscription.voiceChannel.id,
                textId: subscription.textChannel.id,
            },
        });

        this.client.emit(
            DiscordEvents.Debug,
            `Music (DATABASE) >> Updated Queue Position: ${subscription.guild.name} (${subscription.guild.id}) To: ${subscription.position}`
        );
    }
}
