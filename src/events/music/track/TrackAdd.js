import { Event, YouTubeTrack, SpotifyTrack, YouTubePlaylist, SpotifyPlaylist, } from '../../../structures/index.js';
export class TrackAdd extends Event {
    constructor(client, commander) {
        super(client, commander, 'trackAdd');
    }
    async execute(subscription, item) {
        let data;
        if (item instanceof YouTubePlaylist) {
            data = item.tracks.map((track) => new YouTubeTrack(track, item.requester, item.textChannel).toData());
        }
        else if (item instanceof SpotifyPlaylist) {
            data = item.tracks.map((track) => new SpotifyTrack(track, item.requester, item.textChannel).toData());
        }
        else {
            data = item.toData();
        }
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
        this.client.logger.info(`Added ${data instanceof Array ? data.length : 1} Track(s) For: ${subscription.guild.name} (${subscription.guild.id})`, 'Music');
    }
}
