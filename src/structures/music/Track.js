!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="3d4baec9-3362-5940-a33b-176735657da9")}catch(e){}}();
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
//# debugId=3d4baec9-3362-5940-a33b-176735657da9
//# sourceMappingURL=Track.js.map
