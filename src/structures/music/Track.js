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
