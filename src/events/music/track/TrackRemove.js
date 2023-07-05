!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="f1c93037-7204-59d0-af31-f7bc9d552ab1")}catch(e){}}();
import { Event, Events } from '../../../structures/index.js';
import { Events as DiscordEvents } from 'discord.js';
export class TrackRemove extends Event {
    constructor(client, commander) {
        super(client, commander, Events.TrackRemove);
    }
    async execute(subscription) {
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
        this.client.emit(DiscordEvents.Debug, `Music (DATABASE) >> Updated Queue Position: ${subscription.guild.name} (${subscription.guild.id}) To: ${subscription.position}`);
    }
}
//# debugId=f1c93037-7204-59d0-af31-f7bc9d552ab1
//# sourceMappingURL=TrackRemove.js.map
