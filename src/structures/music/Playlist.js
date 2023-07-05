!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="4889716b-6649-56e8-a9c8-99b495d60f57")}catch(e){}}();
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
//# debugId=4889716b-6649-56e8-a9c8-99b495d60f57
//# sourceMappingURL=Playlist.js.map
