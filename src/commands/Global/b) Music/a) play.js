const { SlashCommandBuilder } = require('discord.js');

const play = require('play-dl');

const Commander = require('@commander');
const MusicSubscription = require('@lib/music/subscription');
const Track = require('@lib/music/track');

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
        const channel = int.member.voice.channel;

        if (!channel) return int.editReply({ embeds: [new MusicEmbed(client, int).setTitle('You are not in a channel!')] });

        if (!channel.joinable || !channel.speakable) return int.editReply({ embeds: [new MusicEmbed(client, int).setTitle('I can\'t play in that voice channel!')] });

        let subscription = client.subscriptions.get(int.guildId);

        args = int.options.getString('query');

        if (subscription && subscription.isPlayerPaused()) {
            subscription.unpause();

            const resumed = new MusicEmbed(client, int, 'resumed', subscription.active);

            if (!args) return int.editReply({ embeds: [resumed] });

            int.channel.send({ embeds: [resumed] });
        }

        if (!args) return int.editReply({ embeds: [new MusicEmbed(client, int).setTitle('What should I play?')] });

        if (!subscription) subscription = await MusicSubscription.create(client, channel);

        try {
            const query = args;

            const searching = new MusicEmbed(client, int, 'searching');

            if (query.startsWith('https://open.spotify.com/')) {
                searching.setTitle('<a:loading:928668691997012028> \u200b Searching Spotify...');
                reply = await int.editReply({ embeds: [searching] });

                try {
                    if (play.is_expired()) await play.refreshToken();
                    
                    const search = await play.spotify(query);
                    data = search;
                } catch (err) {
                    reply.edit({ embeds: [new MusicEmbed(client, int).setTitle('You have not provided a valid Spotify URL!')] }).catch(() => int.channel.send({ embeds: [notFound] }));
                    
                    client.logger?.error(err);

                    return subscription.destroy();
                }
            } else if (query.startsWith('https://www.youtube.com/playlist' || 'https://youtube.com/playlist')) {
                reply = await int.editReply({ embeds: [searching] });

                try {
                    const search = await play.playlist_info(query, { incomplete: true });
                    data = search;
                } catch {
                    reply.edit({ embeds: [new MusicEmbed(client, int).setTitle('You have not provided a valid playlist URL!')] });

                    client.logger?.error(err);

                    return subscription.destroy();
                }
            } else {
                reply = await int.editReply({ embeds: [searching] });
                
                const search = await play.search(query, { limit: 1, source: { youtube: 'video' } });
                data = search[0];
            }

            if (!data ||
                !(data instanceof play.YouTubeVideo
                    || data instanceof play.YouTubePlayList
                    || data instanceof play.SpotifyTrack
                    || data instanceof play.SpotifyPlaylist
                    || data instanceof play.SpotifyAlbum
                )) {
                reply.edit({ embeds: [new MusicEmbed(client, int).setTitle('Couldn\'t find your search result. Try again!')] });
                return subscription.destroy();
            }

            const enqueued = new MusicEmbed(client, int, 'enqueued', data);

            if (data instanceof play.YouTubePlayList) {
                for (const youtubeVideo of data.videos) {
                    const track = await Track.create(subscription, int, youtubeVideo, int.user);
                    subscription.add(track);
                }

                return reply.edit({ embeds: [enqueued] });
            }

            if (data instanceof play.SpotifyPlaylist || data instanceof play.SpotifyAlbum) {
                const adding = new MusicEmbed(client, int);
                adding.setTitle('<a:loading:928668691997012028> \u200b Adding tracks...');
                reply.edit({ embeds: [adding] });

                const spotifyTracks = await data.all_tracks();

                for (const spotifyTrack of spotifyTracks) {
                    const track = await Track.create(subscription, int, spotifyTrack, int.user);
                    subscription.add(track);
                }

                return reply.edit({ embeds: [enqueued] });
            }

            const track = await Track.create(subscription, int, data, int.user);
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