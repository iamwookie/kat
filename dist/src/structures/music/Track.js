import { formatDuration } from "../../utils/helpers.js";
class Track {
    data;
    requester;
    textChannel;
    onStart;
    onFinish;
    onError;
    url;
    title;
    duration;
    durationRaw;
    thumbnail;
    constructor(data, requester, textChannel, { ...options }) {
        this.data = data;
        this.requester = requester;
        this.textChannel = textChannel;
        this.data = data;
        this.requester = requester;
        this.textChannel = textChannel;
        this.onStart = options.onStart ? options.onStart : () => { };
        this.onFinish = options.onFinish ? options.onFinish : () => { };
        this.onError = options.onError ? options.onError : () => { };
    }
}
export class YouTubeTrack extends Track {
    data;
    requester;
    textChannel;
    constructor(data, requester, textChannel, { ...options }) {
        super(data, requester, textChannel, { ...options });
        this.data = data;
        this.requester = requester;
        this.textChannel = textChannel;
        this.url = this.data.info.uri;
        this.title = this.data.info.title;
        this.duration = formatDuration(this.data.info.length / 1000);
        this.durationRaw = this.data.info.length;
        this.thumbnail = `https://i.ytimg.com/vi/${this.data.info.identifier}/mqdefault.jpg`;
    }
}
