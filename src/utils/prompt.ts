import { YouTubeTrack, SpotifyTrack, YouTubePlaylist, SpotifyPlaylist, Subscription } from '@structures/index.js';
import { getServiceIcon } from './helpers.js';

export class PromptBuilder {
    constructor(private subscription: Subscription) {}

    setEnqueued(item: YouTubeTrack | SpotifyTrack | YouTubePlaylist | SpotifyPlaylist): string {
        if (item instanceof YouTubePlaylist || item instanceof SpotifyPlaylist) {
            return `${getServiceIcon(item)} \u200b • \u200b Enqueued ${item.tracks.length} tracks from [\`${item.title}\`](${item.url}).`;
        } else {
            return `${getServiceIcon(item)} \u200b • \u200b Enqueued [\`${item.title} [${item.duration}]\`](${item.url}) in position \`${this.subscription.position + this.subscription.queue.length}\`.`;
        }
    }

    setLooped(looped: boolean): string {
        if (looped) {
            return `🔁 \u200b • \u200b Current Track Looped.`;
        } else {
            return `▶️ \u200b • \u200b Current Track Unlooped.`;
        }
    }
}