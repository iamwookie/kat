!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="fe05708c-7944-5111-b09a-270aa6a4573f")}catch(e){}}();
import { formatDuration } from '../../utils/helpers.js';
class Track {
    data;
    requester;
    url;
    title;
    duration;
    durationRaw;
    thumbnail;
    constructor(data, requester) {
        this.data = data;
        this.requester = requester;
        this.url = this.data.info.uri;
        this.title = this.data.info.title;
        this.duration = formatDuration(this.data.info.length);
        this.durationRaw = this.data.info.length;
    }
    // Add guildId as a track property in future
    get raw() {
        return {
            data: JSON.stringify(this.data),
            url: this.url,
            title: this.title,
            requesterId: this.requester.id,
            thumbnail: this.thumbnail ?? null,
        };
    }
}
export class YouTubeTrack extends Track {
    data;
    requester;
    constructor(data, requester) {
        super(data, requester);
        this.data = data;
        this.requester = requester;
        this.thumbnail = `https://i.ytimg.com/vi/${this.data.info.identifier}/mqdefault.jpg`;
    }
}
export class SpotifyTrack extends Track {
    data;
    requester;
    constructor(data, requester) {
        super(data, requester);
        this.data = data;
        this.requester = requester;
        this.title = this.title + ' - ' + this.data.info.author;
    }
}
//# debugId=fe05708c-7944-5111-b09a-270aa6a4573f
//# sourceMappingURL=Track.js.map
