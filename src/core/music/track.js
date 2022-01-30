const DiscordVoice = require('@discordjs/voice');
const play = require('play-dl');
const { MusicEmbed } = require('@utils/other/embeds');

class Track {
    constructor(video, author, onStart, onFinish, onError) {
        this.video = video;
        this.title = video.title;
        this.url = video.url;
        this.durationRaw = video.durationInSec;
        this.duration = video.durationRaw;
        this.author = author;
        this.onStart = onStart ? onStart : () => {};
        this.onFinish = onFinish ? onFinish : () => {};
        this.onError = onError ? onError : () => {};
    }

    static create(client, msg, data, author) {
        try {
            const track = new Track(
                data,
                author,
                function onStart() {
                    let onstart = new MusicEmbed(client, msg, 'playing', this);
                    return msg.channel.send({ embeds: [onstart] });
                },
                function onFinish() {},
                function onError() {
                    let onerror = new MusicEmbed(client, msg).setTitle('Error Playing Track');
                    onerror.setDescription(`[${this.title}](${this.url})`);
                    return msg.channel.send({ embeds: [onerror] });
                }
            );
            console.log(track)
            return track;
        } catch (err) {
            console.error('Music >> Error Creating Track'.red);
            console.error(err);
            return false;
        }
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