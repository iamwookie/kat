import { Event } from '../../../structures/index.js';
import { Events } from 'discord.js';
export class TrackRemove extends Event {
    constructor(client, commander) {
        super(client, commander, 'trackRemove');
    }
    async execute(subscription) {
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
                textId: subscription.textChannel?.id,
            },
        });
        this.client.emit(Events.Debug, `Music (DATABASE) >> Updated Queue Position: ${subscription.guild.name} (${subscription.guild.id}) To: ${subscription.position}`);
    }
}
