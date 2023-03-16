const { createAudioResource } = require('@discordjs/voice');

const play = require('play-dl');

class Track {
    constructor(subscription, interaction, { ...options }) {
        this.client = interaction.client;

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
            } catch (err) {
                this.client.logger?.error(err);
                console.error('Music >> Error Creating Stream'.red);
                console.error(err);
                this.onError(err);

                return reject(err);
            }
        });
    }

    parseDuration(time) {
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor(time / 60);
        const seconds = time - minutes * 60;
        return `${hours > 0 ? hours + ':' : ''}${minutes > 0 ? minutes + ':' : ''}${seconds}`;
    }
}

class YouTubeTrack extends Track {
    constructor(subscription, interaction, data, { ...options }) {
        super(subscription, interaction, { ...options });

        if (!data instanceof play.YouTubeVideo) throw new Error('Data must be an instance of play.YouTubeVideo');

        Object.assign(this, data);

        this.raw = data;
        this.duration = data.durationRaw;
        this.durationRaw = data.durationInSec;
        this.thumbnail = data.thumbnails[0];
    }
}

class SpotifyTrack extends Track {
    constructor(subscription, interaction, data, { ...options }) {
        super(subscription, interaction, { ...options });

        if (!data instanceof play.SpotifyTrack) throw new Error('Data must be an instance of play.SpotifyTrack');

        Object.assign(this, data);

        this.raw = data.spotify;
        this.title = `${data.name} - ${data.artists[0].name}`;
        this.duration = this.parseDuration(data.durationInSec);
        this.durationRaw = data.durationInSec;
        this.thumbnail = data.thumbnail;
    }

    async createResource() {
        return new Promise(async (resolve, reject) => {
            try {
                const search = await play.search(this.artists[0].name + ' - ' + this.name, { limit: 1, source: { youtube: 'video' } });
                if (!search || search.length < 0) throw new Error('No results found!');
                const stream = await play.stream(search[0].url, { quality: 3 });
                const resource = createAudioResource(stream.stream, { metadata: this, inputType: stream.type });

                return resolve(resource);
            } catch (err) {
                this.client.logger?.error(err);
                console.error('Music >> Error Creating Stream'.red);
                console.error(err);
                this.onError(err);

                return reject(err);
            }
        });
    }
}

module.exports = { YouTubeTrack, SpotifyTrack };