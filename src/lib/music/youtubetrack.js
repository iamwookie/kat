const Track = require('./track-new');

class YoutubeTrack extends Track {
    constructor(subscription, { data, requestedBy, onStart, onFinish, onError }) {
        super(subscription, { requestedBy, onStart, onFinish, onError });

        if (!data instanceof play.SpotifyTrack) throw new Error('SpotifyTrack must be an instance of play.SpotifyTrack');

        Object.assign(this, data);

        this.raw = data;
        this.duration = data.durationRaw;
    }
}

module.exports = YoutubeTrack;