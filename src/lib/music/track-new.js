const DiscordVoice = require('@discordjs/voice');

import { steam } from 'play-dl';


class Track {
    constructor(subscription, { requestedBy, onStart, onFinish, onError }) {
        this.subscription = subscription;
        this.requestedBy = requestedBy;

        this.onStart = onStart ? onStart : () => { };
        this.onFinish = onFinish ? onFinish : () => { };
        this.onError = onError ? onError : () => { };
    }

    // static async create(subscription, int, data, author) {
    //     try {
    //         if (data instanceof play.SpotifyTrack) {
    //             let spotify = data;
    //             let search = await play.search(data.artists[0].name + ' - ' + data.name, { limit: 1, source: { youtube: 'video' } });

    //             if (search.length < 0) throw new Error('Spotify track not found!');

    //             data = search[0];
    //             data.spotify = spotify;
    //         }

    //         const track = new Track(
    //             subscription,
    //             {
    //                 data,
    //                 requestedBy: author,
    //                 onStart: () => {
    //                     let onstart = new MusicEmbed(subscription.client, int, 'playing', track);
    //                     return int.channel.send({ embeds: [onstart] });
    //                 },
    //                 onError: () => {
    //                     let onerror = new MusicEmbed(subscription.client, int).setTitle('Error Playing Track | Try Again');
    //                     onerror.setDescription(`[${track.title}](${track.url})`);
    //                     return int.channel.send({ embeds: [onerror] });
    //                 }
    //             }
    //         );

    //         return track;
    //     } catch (err) {
    //         console.error('Music >> Error Creating Track'.red);
    //         console.error(err);
            
    //         subscription.client.logger?.error(err);
    //     }
    // }

    async createResource() {
        return new Promise(async (resolve, reject) => {
            try {
                const stream = await play.stream(this.url, { quality: 3 });
                const resource = DiscordVoice.createAudioResource(stream.stream, { metadata: this, inputType: stream.type });
                
                return resolve(resource);
            } catch (err) {
                console.error('Music >> Error Creating Stream'.red);
                console.error(err);
                this.onError(err);

                return reject(err);
            }
        });
    }

    durationToString() {
        const time = this.duration;
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor(time / 60);
        const seconds = time - minutes * 60;
        return `${hours > 0 ? hours + ':' : ''}${minutes > 0 ? minutes + ':' : ''}${seconds}`;
    }
}

module.exports = Track;