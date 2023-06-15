import { formatDuration } from '../../utils/helpers.js';
class Track {
    data;
    requester;
    textChannel;
    url;
    title;
    duration;
    durationRaw;
    thumbnail;
    constructor(data, requester, textChannel) {
        this.data = data;
        this.requester = requester;
        this.textChannel = textChannel;
        this.url = this.data.info.uri;
        this.title = this.data.info.title;
        this.duration = formatDuration(this.data.info.length);
        this.durationRaw = this.data.info.length;
    }
    // Add guildId as a track property in future
    toData() {
        return {
            data: JSON.stringify(this.data),
            url: this.url,
            title: this.title,
            requesterId: this.requester.id,
            textId: this.textChannel?.id ?? null,
            thumbnail: this.thumbnail ?? null,
        };
    }
}
export class YouTubeTrack extends Track {
    data;
    requester;
    textChannel;
    constructor(data, requester, textChannel) {
        super(data, requester, textChannel);
        this.data = data;
        this.requester = requester;
        this.textChannel = textChannel;
        this.thumbnail = `https://i.ytimg.com/vi/${this.data.info.identifier}/mqdefault.jpg`;
    }
}
export class SpotifyTrack extends Track {
    data;
    requester;
    textChannel;
    constructor(data, requester, textChannel) {
        super(data, requester, textChannel);
        this.data = data;
        this.requester = requester;
        this.textChannel = textChannel;
        // Fix title to add author
    }
}
class Playlist {
    url;
    info;
    tracks;
    requester;
    textChannel;
    title;
    thumbnail;
    constructor(url, info, tracks, requester, textChannel) {
        this.url = url;
        this.info = info;
        this.tracks = tracks;
        this.requester = requester;
        this.textChannel = textChannel;
        this.title = this.info.name;
    }
}
export class YouTubePlaylist extends Playlist {
    url;
    info;
    tracks;
    requester;
    textChannel;
    constructor(url, info, tracks, requester, textChannel) {
        super(url, info, tracks, requester, textChannel);
        this.url = url;
        this.info = info;
        this.tracks = tracks;
        this.requester = requester;
        this.textChannel = textChannel;
        this.thumbnail = `https://i.ytimg.com/vi/${this.tracks[0].info.identifier}/mqdefault.jpg`;
    }
}
export class SpotifyPlaylist extends Playlist {
    url;
    info;
    tracks;
    requester;
    textChannel;
    constructor(url, info, tracks, requester, textChannel) {
        super(url, info, tracks, requester, textChannel);
        this.url = url;
        this.info = info;
        this.tracks = tracks;
        this.requester = requester;
        this.textChannel = textChannel;
    }
}
