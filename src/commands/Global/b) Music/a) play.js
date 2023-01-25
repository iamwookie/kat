const { SlashCommandBuilder } = require('discord.js');

const play = require('play-dl');

const MusicSubscription = require('@lib/music/subscription');
const YouTubeTrack = require('@lib/music/youtubetrack');
const SpotifyTrack = require('@lib/music/spotifytrack');

const MusicEmbed = require('@utils/embeds/music');
const ActionEmbed = require('@utils/embeds/action');

module.exports = {
    name: 'play',
    group: 'Music',
    description: 'Search for a track and play it or add it to the queue.',
    format: '<?search/url>',
    cooldown: 5,

    // SLASH
    data() {
        return (
            new SlashCommandBuilder()
                .setName(this.name)
                .setDescription(this.description)
                .setDMPermission(false)
                .addStringOption(option => {
                    option.setName('query');
                    option.setDescription('The name or URL of the song.');
                    return option;
                })
        );
    },

    async run(client, int) {
        const query = int.options.getString('query');

        const voiceChannel = int.member.voice.channel;
        if (!voiceChannel) return int.editReply({ embeds: [new ActionEmbed('fail', 'You are not in a voice channel!', int.user)] });
        if (!voiceChannel.joinable || !voiceChannel.speakable) return int.editReply({ embeds: [new ActionEmbed('fail', 'I can\'t play in that voice channel!', int.user)] });

        let subscription = client.subscriptions.get(int.guildId);

        if (subscription && subscription.isPlayerPaused()) {
            subscription.unpause();

            const resumed = new MusicEmbed(int, subscription.active).setType('resumed');
            if (!query) return int.editReply({ embeds: [resumed] });
            int.channel.send({ embeds: [resumed] });
        }

        if (!query) return int.editReply({ embeds: [new ActionEmbed('fail', 'What should I play?', int.user)] });

        if (!subscription) subscription = await MusicSubscription.create(int, voiceChannel);

        try {
            if (query.startsWith('https://open.spotify.com/')) {
                try {
                    if (play.is_expired()) await play.refreshToken();

                    const search = await play.spotify(query);
                    data = search;
                } catch (err) {
                    client.logger?.error(err);
                    int.editReply({ embeds: [new ActionEmbed('fail', 'You have not provided a valid Spotify URL!', int.user)] });

                    return subscription.destroy();
                }
            } else if (query.startsWith('https://www.youtube.com/playlist' || 'https://youtube.com/playlist')) {
                try {
                    const search = await play.playlist_info(query, { incomplete: true });
                    data = search;
                } catch {
                    client.logger?.error(err);
                    int.editReply({ embeds: [new ActionEmbed('fail', 'You have not provided a valid playlist URL!', int.user)] });

                    return subscription.destroy();
                }
            } else {
                const search = await play.search(query, { limit: 1, source: { youtube: 'video' } });
                data = search[0];
            }

            if (
                !data ||
                !(
                    data instanceof play.YouTubeVideo ||
                    data instanceof play.YouTubePlayList ||
                    data instanceof play.SpotifyTrack ||
                    data instanceof play.SpotifyPlaylist ||
                    data instanceof play.SpotifyAlbum
                )
            ) {
                int.editReply({ embeds: [new ActionEmbed('fail', 'Couldn\'t find your search result. Try again!', int.user)] });
                return subscription.destroy();
            }

            const enqueued = new MusicEmbed(int, data).setType('enqueued');

            if (data instanceof play.YouTubePlayList) {
                for (const video of data.videos) {
                    const track = new YouTubeTrack(subscription, int, video, int.user);
                    subscription.add(track);
                }

                return reply.edit({ embeds: [enqueued] });
            }

            if (data instanceof play.SpotifyPlaylist || data instanceof play.SpotifyAlbum) {
                const spotifyTracks = await data.all_tracks();

                for (const song of spotifyTracks) {
                    const track = new SpotifyTrack(subscription, int, song, int.user);
                    subscription.add(track);
                }

                return reply.edit({ embeds: [enqueued] });
            }

            const track = new YouTubeTrack(subscription, int, data, int.user);
            subscription.add(track);

            console.log('Music Commands >> play: Added Track'.green);

            return reply.edit({ embeds: [enqueued] });
        } catch (err) {
            console.error('Music Commands (ERROR) >> play: Error Running Command'.red);
            console.error(err);

            client.logger?.error(err);

            return int.editReply({ embeds: [new ActionEmbed('fail', 'An error occured! A developer has been notified!', int.user)] });
        }
    }
};