const Track = require('./track-new');

class SpotifyTrack extends Track {
    constructor(subscription, { data, requestedBy, onStart, onFinish, onError }) {
        super(subscription, { requestedBy, onStart, onFinish, onError });

        if (!data instanceof play.SpotifyTrack) throw new Error('SpotifyTrack must be an instance of play.SpotifyTrack');

        Object.assign(this, data.spotify);

        this.raw = data.spotify;
        this.duration = data.durationInMs;
        this.url = data.url;
    }
}

module.exports = SpotifyTrack;