const DiscordVoice = require('@discordjs/voice');
const play = require('play-dl');

class Track {
    constructor(video, author, onStart, onFinish, onError) {
        this.video = video;
        this.title = video.title;
        this.url = video.url;
        this.duration = video.durationRaw;
        this.durationRaw = video.durationInSec;
        this.author = author;
        this.onStart = onStart ? onStart : () => {};
        this.onFinish = onFinish ? onFinish : () => {};
        this.onError = onError ? onError : () => {};
    }

    async createResource() {
        return new Promise(async (resolve, reject) => {
            try {
                const stream = await play.stream(this.url);
                resolve(DiscordVoice.createAudioResource(stream.stream, { metadata: this, inputType: stream.type }));
            } catch(err) {
                reject(err);
            }
        });
    }
}

module.exports = Track;