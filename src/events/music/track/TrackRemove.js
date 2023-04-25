import { Event } from '../../../structures/index.js';
export class TrackRemove extends Event {
    constructor(client, commander) {
        super(client, commander, 'trackRemove');
    }
    async execute(subscription) {
        subscription.position += 1;
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
    }
}
