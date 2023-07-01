import { YouTubeTrack, SpotifyTrack } from "./Track.js";
export class YouTubePlaylist {
    url;
    info;
    requester;
    title;
    thumbnail;
    tracks;
    constructor(url, info, requester, tracks) {
        this.url = url;
        this.info = info;
        this.requester = requester;
        this.title = this.info.name;
        this.tracks = tracks.map((track) => new YouTubeTrack(track, requester));
        this.thumbnail = `https://i.ytimg.com/vi/${this.tracks[0].data.info.identifier}/mqdefault.jpg`;
    }
}
export class SpotifyPlaylist {
    url;
    info;
    requester;
    title;
    thumbnail;
    tracks;
    constructor(url, info, requester, tracks) {
        this.url = url;
        this.info = info;
        this.requester = requester;
        this.title = this.info.name;
        this.tracks = tracks.map((track) => new SpotifyTrack(track, requester));
    }
}
