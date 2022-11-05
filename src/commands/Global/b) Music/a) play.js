const Commander = require('@commander');
const { SlashCommandBuilder } = require('@discordjs/builders');
const MusicSubscription = require('@core/music/subscription');
const Track = require('@core/music/track');
const play = require('play-dl');
const MusicEmbed = require('@utils/embeds/music');

module.exports = {
    name: 'play',
    group: 'Music',
    description: 'Search for a track and play it or add it to the queue.',
    format: '<?search/url>',
    cooldown: 5,
    guildOnly: true,

    // SLASH
    data() {
        return (
            new SlashCommandBuilder()
                .setName(this.name)
                .setDescription(this.description)
                .addStringOption(option => {
                    option.setName('query');
                    option.setDescription('The name or URL of the song.');
                    return option;
                })
        );
    },

    async run(client, int) {
        let channel = int.member.voice.channel;

        if (!channel) {
            let nochannel = new MusicEmbed(client, int).setTitle('You are not in a channel!');
            return int.editReply({ embeds: [nochannel] });
        }

        if (!channel.joinable || !channel.speakable) {
            let noperms = new MusicEmbed(client, int).setTitle('I can\'t play in that voice channel!');
            return int.editReply({ embeds: [noperms] });
        }

        let subscription = client.subscriptions.get(int.guildId);

        args = int.options.getString('query');

        if (subscription && subscription.isPlayerPaused()) {
            subscription.unpause();
            let resumed = new MusicEmbed(client, int, 'resumed', subscription.active);
            if (!args) return int.editReply({ embeds: [resumed] });
            int.channel.send({ embeds: [resumed] });
        }

        if (!args) {
            let noargs = new MusicEmbed(client, int).setTitle('What should I play?');
            return int.editReply({ embeds: [noargs] });
        }

        if (!subscription) subscription = await MusicSubscription.create(client, channel);

        try {
            let query = args;

            let searching = new MusicEmbed(client, int, 'searching');

            if (query.startsWith('https://open.spotify.com/')) {
                searching.setTitle('<a:loading:928668691997012028> \u200b Searching Spotify...');
                reply = await int.editReply({ embeds: [searching] });

                try {
                    if (play.is_expired()) await play.refreshToken();
                    let search = await play.spotify(query);
                    data = search;
                } catch (err) {
                    let notFound = new MusicEmbed(client, int).setTitle('You have not provided a valid Spotify URL!');
                    reply.edit({ embeds: [notFound] }).catch(() => int.channel.send({ embeds: [notFound] }));
                    Commander.handleError(client, err);
                    return subscription.destroy();
                }
            } else if (query.startsWith('https://www.youtube.com/playlist' || 'https://youtube.com/playlist')) {
                reply = await int.editReply({ embeds: [searching] });

                try {
                    let search = await play.playlist_info(query, { incomplete: true });
                    data = search;
                } catch {
                    let notFound = new MusicEmbed(client, int).setTitle('You have not provided a valid playlist URL!');
                    reply.edit({ embeds: [notFound] });
                    Commander.handleError(client, err);
                    return subscription.destroy();
                }
            } else {
                reply = await int.editReply({ embeds: [searching] });
                let search = await play.search(query, { limit: 1, source: { youtube: 'video' } });
                data = search[0];
            }

            if (!data ||
                !(data instanceof play.YouTubeVideo
                    || data instanceof play.YouTubePlayList
                    || data instanceof play.SpotifyTrack
                    || data instanceof play.SpotifyPlaylist
                    || data instanceof play.SpotifyAlbum
                )) {
                let notFound = new MusicEmbed(client, int).setTitle('Couldn\'t find your search result. Try again!');
                reply.edit({ embeds: [notFound] });
                return subscription.destroy();
            }

            let enqueued = new MusicEmbed(client, int, 'enqueued', data);

            if (data instanceof play.YouTubePlayList) {
                for (const youtubeVideo of data.videos) {
                    let track = await Track.create(subscription, int, youtubeVideo, int.user);
                    subscription.add(track);
                }

                return reply.edit({ embeds: [enqueued] });
            }

            if (data instanceof play.SpotifyPlaylist || data instanceof play.SpotifyAlbum) {
                let adding = new MusicEmbed(client, int);
                adding.setTitle('<a:loading:928668691997012028> \u200b Adding tracks...');
                reply.edit({ embeds: [adding] });

                let spotifyTracks = await data.all_tracks();

                for (const spotifyTrack of spotifyTracks) {
                    let track = await Track.create(subscription, int, spotifyTrack, int.user);
                    subscription.add(track);
                }

                return reply.edit({ embeds: [enqueued] });
            }

            let track = await Track.create(subscription, int, data, int.user);
            subscription.add(track);
            console.log('Music Commands >> play: Added Track'.green);

            return reply.edit({ embeds: [enqueued] });
        } catch (err) {
            console.error('Music Commands (ERROR) >> play: Error Running Command'.red);
            console.error(err);
            Commander.handleError(client, err, false, int.guild);

            let fail = new MusicEmbed(client, int).setTitle('An error occured! A developer has been notified!');
            return int.editReply({ embeds: [fail] });
        }
    }
};