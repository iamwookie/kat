class Track {
    data;
    info;
    interaction;
    requester;
    onStart;
    onFinish;
    onError;
    url;
    title;
    description;
    duration;
    durationRaw;
    thumbnail;
    type;
    constructor(data, info, interaction, { ...options }) {
        this.data = data;
        this.info = info;
        this.interaction = interaction;
        this.data = data;
        this.info = info;
        this.interaction = interaction;
        this.requester = interaction.user;
        this.onStart = options.onStart ? options.onStart : () => { };
        this.onFinish = options.onFinish ? options.onFinish : () => { };
        this.onError = options.onError ? options.onError : () => { };
    }
}
export class YouTubeTrack extends Track {
    data;
    info;
    interaction;
    constructor(data, info, interaction, { ...options }) {
        super(data, info, interaction, { ...options });
        this.data = data;
        this.info = info;
        this.interaction = interaction;
        this.url = this.data.info.uri;
        this.title = this.data.info.title;
        this.description = this.info.video_details.description;
        this.duration = this.info.video_details.durationRaw;
        this.durationRaw = this.data.info.length;
        this.thumbnail = this.info.video_details.thumbnails ? this.info.video_details.thumbnails[0] : undefined;
    }
}
