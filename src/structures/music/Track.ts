import { KATClient as Client } from "../Client.js";
import { ChatInputCommandInteraction, User } from "discord.js";
import { Track as ShoukakuTrack } from "shoukaku";
import { InfoData } from "play-dl";

export type TrackMetadata = {
    onStart?: () => void;
    onFinish?: () => void;
    onError?: (err: Error | unknown) => void;
};

abstract class Track {
    public requester: User;

    public onStart: () => void;
    public onFinish: () => void;
    public onError: (err: any) => void;

    public url: string;
    public title?: string;
    public description?: string;
    public duration: string;
    public durationRaw: number;
    public thumbnail?: any;
    public type: "video" | "track" | "playlist" | "album" | "channel";

    constructor(
        public data: ShoukakuTrack,
        public info: InfoData,
        public interaction: ChatInputCommandInteraction,
        { ...options }: TrackMetadata
    ) {
        this.data = data;
        this.info = info;
        this.interaction = interaction;
        this.requester = interaction.user;

        this.onStart = options.onStart ? options.onStart : () => {};
        this.onFinish = options.onFinish ? options.onFinish : () => {};
        this.onError = options.onError ? options.onError : () => {};
    }
}

export class YouTubeTrack extends Track {
    constructor(
        public data: ShoukakuTrack,
        public info: InfoData,
        public interaction: ChatInputCommandInteraction,
        { ...options }: TrackMetadata,
    ) {
        super(data, info, interaction, { ...options });

        this.url = this.data.info.uri;
        this.title = this.data.info.title;
        this.description = this.info.video_details.description;
        this.duration = this.info.video_details.durationRaw;
        this.durationRaw = this.data.info.length;
        this.thumbnail = this.info.video_details.thumbnails ? this.info.video_details.thumbnails[0] : undefined;
    }
}
