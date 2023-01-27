const DiscordVoice = require('@discordjs/voice');

const play = require('play-dl');

const MusicEmbed = require('@utils/embeds/music');

class Track {
    constructor(subscription, { data, requestedBy, onStart, onFinish, onError }) {
        this.subscription = subscription;

        this.data = data;
        this.title = data.title;
        this.url = data.url;
        this.thumbnail = data.thumbnails[0];
        this.spotify = data.spotify;
        this.duration = data.durationRaw;
        this.durationRaw = data.durationInSec;

        this.requestedBy = requestedBy;
        this.onStart = onStart ? onStart : () => { };
        this.onFinish = onFinish ? onFinish : () => { };
        this.onError = onError ? onError : () => { };
    }

    static async create(subscription, int, data, author) {
        try {
            if (data instanceof play.SpotifyTrack) {
                let spotify = data;
                let search = await play.search(data.artists[0].name + ' - ' + data.name, { limit: 1, source: { youtube: 'video' } });

                if (search.length < 0) throw new Error('Spotify track not found!');

                data = search[0];
                data.spotify = spotify;
            }

            const track = new Track(
                subscription,
                {
                    data,
                    requestedBy: author,
                    onStart: () => {
                        let onstart = new MusicEmbed(subscription.client, int, 'playing', track);
                        return int.channel.send({ embeds: [onstart] });
                    },
                    onError: () => {
                        let onerror = new MusicEmbed(subscription.client, int).setTitle('Error Playing Track | Try Again');
                        onerror.setDescription(`[${track.title}](${track.url})`);
                        return int.channel.send({ embeds: [onerror] });
                    }
                }
            );

            return track;
        } catch (err) {
            console.error('Music >> Error Creating Track'.red);
            console.error(err);

            subscription.client.logger?.error(err);
        }
    }

    async createResource() {
        return new Promise(async (resolve, reject) => {
            try {
                const stream = await play.stream(this.url, { quality: 3 });
                return resolve(DiscordVoice.createAudioResource(stream.stream, { metadata: this, inputType: stream.type }));
            } catch (err) {
                console.error('Music >> Error Creating Stream'.red);
                console.error(err);
                this.onError(err);
                return reject(err);
            }
        });
    }
}

module.exports = Track;