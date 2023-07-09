!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="076c87a9-90f7-58d0-bff0-685ce52bf19a")}catch(e){}}();
import { YouTubeTrack, SpotifyTrack } from './Track.js';
export class YouTubePlaylist {
    url;
    info;
    requester;
    title;
    thumbnail;
    tracks;
    // prettier-ignore
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
    // prettier-ignore
    constructor(url, info, requester, tracks) {
        this.url = url;
        this.info = info;
        this.requester = requester;
        this.title = this.info.name;
        this.tracks = tracks.map((track) => new SpotifyTrack(track, requester));
    }
}
//# debugId=076c87a9-90f7-58d0-bff0-685ce52bf19a
//# sourceMappingURL=Playlist.js.map
