import { formatDuration } from "../../utils/helpers.js";
class Track {
    client;
    data;
    requester;
    textChannel;
    url;
    title;
    duration;
    durationRaw;
    thumbnail;
    onStart;
    onFinish;
    onError;
    constructor(client, data, requester, textChannel) {
        this.client = client;
        this.data = data;
        this.requester = requester;
        this.textChannel = textChannel;
        this.url = this.data.info.uri;
        this.title = this.data.info.title;
        this.duration = formatDuration(this.data.info.length);
        this.durationRaw = this.data.info.length;
        this.onStart = () => { };
        this.onFinish = () => { };
        this.onError = (err) => {
            this.client.logger.error(err);
            this.textChannel?.send(`An error occurred while playing **${this.title}**. Skipping...`);
        };
    }
}
export class YouTubeTrack extends Track {
    client;
    data;
    requester;
    textChannel;
    constructor(client, data, requester, textChannel) {
        super(client, data, requester, textChannel);
        this.client = client;
        this.data = data;
        this.requester = requester;
        this.textChannel = textChannel;
        this.thumbnail = `https://i.ytimg.com/vi/${this.data.info.identifier}/mqdefault.jpg`;
    }
}
export class SpotifyTrack extends Track {
    client;
    data;
    requester;
    textChannel;
    constructor(client, data, requester, textChannel) {
        super(client, data, requester, textChannel);
        this.client = client;
        this.data = data;
        this.requester = requester;
        this.textChannel = textChannel;
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