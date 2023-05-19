import type { QueueData } from 'types';
import {
    Event,
    KATClient as Client,
    Commander,
    Subscription as MusicSubscription,
    YouTubeTrack,
    SpotifyTrack,
    YouTubePlaylist,
    SpotifyPlaylist,
} from '@structures/index.js';

export class TrackAdd extends Event {
    constructor(client: Client, commander: Commander) {
        super(client, commander, 'trackAdd');
    }

    async execute(subscription: MusicSubscription, item: YouTubeTrack | SpotifyTrack | YouTubePlaylist | SpotifyPlaylist) {
        let data: QueueData | QueueData[];

        if (item instanceof YouTubePlaylist) {
            data = item.tracks.map((track) => new YouTubeTrack(this.client, track, item.requester, item.textChannel).toData());
        } else if (item instanceof SpotifyPlaylist) {
            data = item.tracks.map((track) => new SpotifyTrack(this.client, track, item.requester, item.textChannel).toData());
        } else {
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

        this.client.logger.info(
            `Added ${data instanceof Array ? data.length : 1} Track(s) For: ${subscription.guild.name} (${subscription.guild.id})`,
            'Music'
        );
    }
}
