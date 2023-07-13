!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="16b3456d-7823-5c55-8f92-8f49dc4a982d")}catch(e){}}();
import { YouTubePlaylist, SpotifyPlaylist } from '../structures/index.js';
import { getServiceIcon } from './helpers.js';
export class PromptBuilder {
    subscription;
    constructor(subscription) {
        this.subscription = subscription;
    }
    setEnqueued(item) {
        if (item instanceof YouTubePlaylist || item instanceof SpotifyPlaylist) {
            return `${getServiceIcon(item)} \u200b • \u200b Enqueued ${item.tracks.length} tracks from [\`${item.title}\`](${item.url}).`;
        }
        else {
            return `${getServiceIcon(item)} \u200b • \u200b Enqueued [\`${item.title} [${item.duration}]\`](${item.url}) in position \`${this.subscription.position + this.subscription.queue.length}\`.`;
        }
    }
    setLooped(looped) {
        if (looped) {
            return `🔁 \u200b • \u200b Current Track Looped.`;
        }
        else {
            return `▶️ \u200b • \u200b Current Track Unlooped.`;
        }
    }
}
//# debugId=16b3456d-7823-5c55-8f92-8f49dc4a982d
//# sourceMappingURL=prompt.js.map
