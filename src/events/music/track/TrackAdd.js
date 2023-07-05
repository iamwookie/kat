!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="83912de7-5e60-568d-9bd8-26b3f9859489")}catch(e){}}();
import { Event, Events, YouTubePlaylist, SpotifyPlaylist } from '../../../structures/index.js';
export class TrackAdd extends Event {
    constructor(client, commander) {
        super(client, commander, Events.TrackAdd);
    }
    async execute(subscription, item) {
        const data = item instanceof YouTubePlaylist || item instanceof SpotifyPlaylist ? item.tracks.map((track) => track.raw) : item.raw;
        await this.client.prisma.queue.upsert({
            where: {
                guildId: subscription.guild.id,
            },
            update: {
                tracks: {
                    createMany: {
                        data,
                    },
                },
            },
            create: {
                guildId: subscription.guild.id,
                voiceId: subscription.voiceChannel.id,
                textId: subscription.textChannel.id,
                tracks: {
                    createMany: {
                        data,
                    },
                },
            },
        });
        this.client.logger.info(`Added ${data instanceof Array ? data.length : 1} Track(s) For: ${subscription.guild.name} (${subscription.guild.id})`, 'Dispatcher');
    }
}
//# debugId=83912de7-5e60-568d-9bd8-26b3f9859489
//# sourceMappingURL=TrackAdd.js.map
