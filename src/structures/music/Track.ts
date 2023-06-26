import { User } from 'discord.js';
import { Track as ShoukakuTrack, LavalinkResponse } from 'shoukaku';
import { formatDuration } from '@utils/helpers.js';
import { QueueData } from 'types';

abstract class Track {
    public url: string;
    public title: string;
    public duration: string;
    public durationRaw: number;
    public thumbnail?: string;

    constructor(public data: ShoukakuTrack, public requester: User) {
        this.url = this.data.info.uri;
        this.title = this.data.info.title;
        this.duration = formatDuration(this.data.info.length);
        this.durationRaw = this.data.info.length;
    }

    // Add guildId as a track property in future
    public get raw(): QueueData {
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
    constructor(public data: ShoukakuTrack, public requester: User) {
        super(data, requester);
        this.thumbnail = `https://i.ytimg.com/vi/${this.data.info.identifier}/mqdefault.jpg`;
    }
}

export class SpotifyTrack extends Track {
    constructor(public data: ShoukakuTrack, public requester: User) {
        super(data, requester);
        // Fix title to add author
    }
}

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
        // Might make all tracks SpotifyTrack
    }
}
