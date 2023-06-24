import { TextBasedChannel, User } from 'discord.js';
import { Track as ShoukakuTrack, LavalinkResponse } from 'shoukaku';
import { formatDuration } from '@utils/helpers.js';
import { QueueData } from 'types';

abstract class Track {
    public url: string;
    public title: string;
    public duration: string;
    public durationRaw: number;
    public thumbnail?: string;

    constructor(
        public data: ShoukakuTrack,
        public requester: User,
        public textChannel: TextBasedChannel | null
    ) {
        this.url = this.data.info.uri;
        this.title = this.data.info.title;
        this.duration = formatDuration(this.data.info.length);
        this.durationRaw = this.data.info.length;
    }

    // Add guildId as a track property in future
    toData(): QueueData {
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
    constructor(
        public data: ShoukakuTrack,
        public requester: User,
        public textChannel: TextBasedChannel | null
    ) {
        super(data, requester, textChannel);
        this.thumbnail = `https://i.ytimg.com/vi/${this.data.info.identifier}/mqdefault.jpg`;
    }
}

export class SpotifyTrack extends Track {
    constructor(
        public data: ShoukakuTrack,
        public requester: User,
        public textChannel: TextBasedChannel | null
    ) {
        super(data, requester, textChannel);
        // Fix title to add author
    }
}

abstract class Playlist {
    public title: string;
    public thumbnail?: string;

    constructor(
        public url: URL,
        public info: LavalinkResponse['playlistInfo'],
        public tracks: ShoukakuTrack[],
        public requester: User,
        public textChannel: TextBasedChannel | null
    ) {
        this.title = this.info.name!;
    }
}

export class YouTubePlaylist extends Playlist {
    constructor(
        public url: URL,
        public info: LavalinkResponse['playlistInfo'],
        public tracks: ShoukakuTrack[],
        public requester: User,
        public textChannel: TextBasedChannel | null
    ) {
        super(url, info, tracks, requester, textChannel);
        this.thumbnail = `https://i.ytimg.com/vi/${this.tracks[0].info.identifier}/mqdefault.jpg`;
    }
}

export class SpotifyPlaylist extends Playlist {
    constructor(
        public url: URL,
        public info: LavalinkResponse['playlistInfo'],
        public tracks: ShoukakuTrack[],
        public requester: User,
        public textChannel: TextBasedChannel | null
    ) {
        super(url, info, tracks, requester, textChannel);
    }
}
