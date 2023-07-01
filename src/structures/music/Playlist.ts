import { LavalinkResponse, Track as ShoukakuTrack } from "shoukaku";
import { YouTubeTrack, SpotifyTrack } from "./Track.js";
import { User } from "discord.js";

interface Playlist {
    url: URL;
    info: LavalinkResponse['playlistInfo'];
    tracks: (YouTubeTrack | SpotifyTrack)[];
    requester: User;
}

export class YouTubePlaylist implements Playlist {
    public title: string;
    public thumbnail?: string;
    public tracks: YouTubeTrack[];

    constructor(
        public url: URL,
        public info: LavalinkResponse['playlistInfo'],
        public requester: User,
        tracks: ShoukakuTrack[]
    ) {
        this.title = this.info.name!;
        this.tracks = tracks.map((track) => new YouTubeTrack(track, requester));
        this.thumbnail = `https://i.ytimg.com/vi/${this.tracks[0].data.info.identifier}/mqdefault.jpg`;
    }
}

export class SpotifyPlaylist implements Playlist {
    public title: string;
    public thumbnail?: string;
    public tracks: SpotifyTrack[];

    constructor(
        public url: URL,
        public info: LavalinkResponse['playlistInfo'],
        public requester: User,
        tracks: ShoukakuTrack[]
    ) {
        this.title = this.info.name!;
        this.tracks = tracks.map((track) => new SpotifyTrack(track, requester));
    }
}
