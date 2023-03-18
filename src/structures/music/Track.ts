import { KATClient } from "@structures/index.js";
import { CommandInteraction, User } from "discord.js";
import { createAudioResource, AudioResource } from "@discordjs/voice";

import play from "play-dl";
import { Subscription as MusicSubscription } from "./Subscription.js";
import { formatDuration } from "src/utils/helpers.js";

import chalk from "chalk";

export type TrackMetadata = {
    onStart?: () => void;
    onFinish?: () => void;
    onError?: (err: Error | unknown) => void;
};

abstract class Track {
    public requestedBy: User;

    public onStart: () => void;
    public onFinish: () => void;
    public onError: (err: Error | unknown) => void;

    public raw: play.YouTubeVideo | play.SpotifyTrack;

    public url: string;
    public title?: string;
    public description?: string;
    public duration: string;
    public durationRaw: number;
    public thumbnail?: any;
    public type: "video" | "track" | "playlist" | "album" | "channel";

    constructor(
        public client: KATClient,
        public subscription: MusicSubscription,
        public interaction: CommandInteraction,
        { ...options }: TrackMetadata
    ) {
        this.client = client;

        this.subscription = subscription;
        this.interaction = interaction;
        this.requestedBy = interaction.user;

        this.onStart = options.onStart ? options.onStart : () => {};
        this.onFinish = options.onFinish ? options.onFinish : () => {};
        this.onError = options.onError ? options.onError : () => {};
    }

    async createResource(): Promise<AudioResource> {
        return new Promise(async (resolve, reject) => {
            try {
                const stream = await play.stream(this.url, { quality: 2 });
                const resource = createAudioResource(stream.stream, { metadata: this, inputType: stream.type });

                return resolve(resource);
            } catch (err) {
                this.client.logger.error(err);
                console.error(chalk.red("Music >> Error Creating Stream"));
                console.error(err);
                this.onError(err);

                return reject(err);
            }
        });
    }
}

export class YouTubeTrack extends Track {
    constructor(client: KATClient, subscription: MusicSubscription, interaction: CommandInteraction, data: play.YouTubeVideo, { ...options }: TrackMetadata) {
        super(client, subscription, interaction, { ...options });

        this.raw = data;
        this.url = data.url;
        this.type = data.type;

        this.title = data.title;
        this.description = data.description;
        this.duration = data.durationRaw;
        this.durationRaw = data.durationInSec;
        this.thumbnail = data.thumbnails[0];
    }
}

export class SpotifyTrack extends Track {
    private name: string;
    private artists: any[];

    constructor(client: KATClient, subscription: MusicSubscription, interaction: CommandInteraction, data: play.SpotifyTrack, { ...options }: TrackMetadata) {
        super(client, subscription, interaction, { ...options });

        this.raw = data;
        this.url = data.url;
        this.type = data.type;

        this.title = `${data.name} - ${data.artists[0].name}`;
        this.duration = formatDuration(data.durationInSec);
        this.durationRaw = data.durationInSec;
        this.thumbnail = data.thumbnail;

        this.name = data.name;
        this.artists = data.artists;
    }

    async createResource(): Promise<AudioResource> {
        return new Promise(async (resolve, reject) => {
            try {
                const search = await play.search(this.artists[0].name + " - " + this.name, { limit: 1, source: { youtube: "video" } });
                if (!search || search.length < 0) throw new Error("No results found!");
                const stream = await play.stream(search[0].url, { quality: 3 });
                const resource = createAudioResource(stream.stream, { metadata: this, inputType: stream.type });

                return resolve(resource);
            } catch (err) {
                this.client.logger.error(err);
                console.error(chalk.red("Music >> Error Creating Spotify Stream"));
                console.error(err);
                this.onError(err);

                return reject(err);
            }
        });
    }
}
