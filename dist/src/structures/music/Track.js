import { formatDuration } from "../../utils/helpers.js";
class Track {
    client;
    data;
    requester;
    textChannel;
    url;
    title;
    duration;
    durationRaw;
    thumbnail;
    onStart;
    onFinish;
    onError;
    constructor(client, data, requester, textChannel) {
        this.client = client;
        this.data = data;
        this.requester = requester;
        this.textChannel = textChannel;
        this.client = client;
        this.data = data;
        this.requester = requester;
        this.textChannel = textChannel;
        this.url = this.data.info.uri;
        this.title = this.data.info.title;
        this.duration = formatDuration(this.data.info.length);
        this.durationRaw = this.data.info.length;
        this.onStart = () => { };
        this.onFinish = () => { };
        this.onError = (err) => {
            this.client.logger.error(err);
            this.textChannel?.send(`An error occurred while playing **${this.title}**. Skipping...`);
        };
    }
}
export class YouTubeTrack extends Track {
    client;
    data;
    requester;
    textChannel;
    constructor(client, data, requester, textChannel) {
        super(client, data, requester, textChannel);
        this.client = client;
        this.data = data;
        this.requester = requester;
        this.textChannel = textChannel;
        this.thumbnail = `https://i.ytimg.com/vi/${this.data.info.identifier}/mqdefault.jpg`;
    }
}
export class SpotifyTrack extends Track {
    client;
    data;
    requester;
    textChannel;
    constructor(client, data, requester, textChannel) {
        super(client, data, requester, textChannel);
        this.client = client;
        this.data = data;
        this.requester = requester;
        this.textChannel = textChannel;
    }
}
