import { TextBasedChannel, User } from "discord.js";
import { Track as ShoukakuTrack } from "shoukaku";

import { formatDuration } from "@src/utils/helpers.js";

export type TrackMetadata = {
    onStart?: () => void;
    onFinish?: () => void;
    onError?: (err: Error | unknown) => void;
};

abstract class Track {
    public onStart: () => void;
    public onFinish: () => void;
    public onError: (err: any) => void;

    public url: string;
    public title: string;
    public duration: string;
    public durationRaw: number;
    public thumbnail: string;
    
    constructor(
        public data: ShoukakuTrack,
        public requester: User,
        public textChannel: TextBasedChannel | null,
        { ...options }: TrackMetadata
    ) {
        this.data = data;
        this.requester = requester;
        this.textChannel = textChannel;

        this.onStart = options.onStart ? options.onStart : () => {};
        this.onFinish = options.onFinish ? options.onFinish : () => {};
        this.onError = options.onError ? options.onError : () => {};
    }
}

export class YouTubeTrack extends Track {
    constructor(
        public data: ShoukakuTrack,
        public requester: User,
        public textChannel: TextBasedChannel | null,
        { ...options }: TrackMetadata
    ) {
        super(data, requester, textChannel, { ...options });
        
        this.url = this.data.info.uri;
        this.title = this.data.info.title;
        this.duration = formatDuration(this.data.info.length / 1000);
        this.durationRaw = this.data.info.length;
        this.thumbnail = `https://i.ytimg.com/vi/${this.data.info.identifier}/mqdefault.jpg`;
    }
}
