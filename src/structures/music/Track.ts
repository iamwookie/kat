import { KATClient as Client } from "../Client";
import { TextBasedChannel, User } from "discord.js";
import { Track as ShoukakuTrack, LavalinkResponse } from "shoukaku";

import { formatDuration } from "@src/utils/helpers.js";

abstract class Track {
    public url: string;
    public title: string;
    public duration: string;
    public durationRaw: number;
    public thumbnail?: string;

    public onStart: () => void;
    public onFinish: () => void;
    public onError: (err: any) => void;
    
    constructor(
        public client: Client,
        public data: ShoukakuTrack,
        public requester: User,
        public textChannel: TextBasedChannel | null,
    ) {
        this.client = client;
        this.data = data;
        this.requester = requester;
        this.textChannel = textChannel;

        this.url = this.data.info.uri;
        this.title = this.data.info.title;
        this.duration = formatDuration(this.data.info.length);
        this.durationRaw = this.data.info.length;

        this.onStart = () => {};
        this.onFinish = () => {};
        this.onError = (err) => {
            this.client.logger.error(err);
            this.textChannel?.send(`An error occurred while playing **${this.title}**. Skipping...`);
        }
    }
}

abstract class Playlist {
    public title: string;
    public thumbnail?: string;

    constructor(
        public url: URL,
        public tracks: ShoukakuTrack[],
        public info: LavalinkResponse["playlistInfo"],
    ) {
        this.tracks = tracks;
        this.info = info;

        this.url = url
        this.title = this.info.name!;
    }
}

export class YouTubeTrack extends Track {
    constructor(
        public client: Client,
        public data: ShoukakuTrack,
        public requester: User,
        public textChannel: TextBasedChannel | null,
    ) {
        super(client, data, requester, textChannel);

        this.thumbnail = `https://i.ytimg.com/vi/${this.data.info.identifier}/mqdefault.jpg`;
    }
}

export class SpotifyTrack extends Track {
    constructor(
        public client: Client,
        public data: ShoukakuTrack,
        public requester: User,
        public textChannel: TextBasedChannel | null,
    ) {
        super(client, data, requester, textChannel);
    }
}

export class YouTubePlaylist extends Playlist {
    constructor(
        public url: URL,
        public tracks: ShoukakuTrack[],
        public info: LavalinkResponse["playlistInfo"],
    ) {
        super(url, tracks, info);

        this.thumbnail = `https://i.ytimg.com/vi/${this.tracks[0].info.identifier}/mqdefault.jpg`;
    }
}

export class SpotifyPlaylist extends Playlist {
    constructor(
        public url: URL,
        public tracks: ShoukakuTrack[],
        public info: LavalinkResponse["playlistInfo"],
    ) {
        super(url, tracks, info);
    }
}