import { createAudioResource } from "@discordjs/voice";
import play from "play-dl";
import { formatDuration } from "../../../src/utils/helpers.js";
import chalk from "chalk";
class Track {
    client;
    subscription;
    interaction;
    requestedBy;
    onStart;
    onFinish;
    onError;
    raw;
    url;
    title;
    description;
    duration;
    durationRaw;
    thumbnail;
    type;
    constructor(client, subscription, interaction, { ...options }) {
        this.client = client;
        this.subscription = subscription;
        this.interaction = interaction;
        this.client = client;
        this.subscription = subscription;
        this.interaction = interaction;
        this.requestedBy = interaction.user;
        this.onStart = options.onStart ? options.onStart : () => { };
        this.onFinish = options.onFinish ? options.onFinish : () => { };
        this.onError = options.onError ? options.onError : () => { };
    }
    async createResource() {
        return new Promise(async (resolve, reject) => {
            try {
                const stream = await play.stream(this.url, { quality: 2 });
                const resource = createAudioResource(stream.stream, { metadata: this, inputType: stream.type });
                return resolve(resource);
            }
            catch (err) {
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
    constructor(client, subscription, interaction, data, { ...options }) {
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
    name;
    artists;
    constructor(client, subscription, interaction, data, { ...options }) {
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
    async createResource() {
        return new Promise(async (resolve, reject) => {
            try {
                const search = await play.search(this.artists[0].name + " - " + this.name, { limit: 1, source: { youtube: "video" } });
                if (!search || search.length < 0)
                    throw new Error("No results found!");
                const stream = await play.stream(search[0].url, { quality: 3 });
                const resource = createAudioResource(stream.stream, { metadata: this, inputType: stream.type });
                return resolve(resource);
            }
            catch (err) {
                this.client.logger.error(err);
                console.error(chalk.red("Music >> Error Creating Spotify Stream"));
                console.error(err);
                this.onError(err);
                return reject(err);
            }
        });
    }
}
