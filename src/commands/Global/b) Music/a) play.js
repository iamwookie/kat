const { SlashCommandBuilder } = require('discord.js');

const play = require('play-dl');

const MusicSubscription = require('@lib/music/subscription');
const { YouTubeTrack, SpotifyTrack } = require('@lib/music/tracks');

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
                    option.setDescription('The name or URL of the track.');
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

            const resumed = new MusicEmbed(int).setResumed(subscription).setQueue(subscription);
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

                    if (search instanceof play.SpotifyTrack) {
                        const track = new SpotifyTrack(subscription, int, search, {
                            onStart: () => int.channel.send({ embeds: [new MusicEmbed(int).setPlaying(subscription).setQueue(subscription)] }),
                            onError: () => int.channel.send({ embeds: [new ActionEmbed('fail', 'An error occured while playing a track!', int.user)] })
                        });
                        subscription.add(track);

                        return int.editReply({ embeds: [new MusicEmbed(int).setItem(track).setEnqueued(subscription)] });
                    } else if (search instanceof play.SpotifyPlaylist || search instanceof play.SpotifyAlbum) {
                        const spotifyTracks = await search.all_tracks();

                        for (const item of spotifyTracks) {
                            const track = new SpotifyTrack(subscription, int, item, {
                                onStart: () => int.channel.send({ embeds: [new MusicEmbed(int).setPlaying(subscription).setQueue(subscription)] }),
                                onError: () => int.channel.send({ embeds: [new ActionEmbed('fail', 'An error occured while playing a track!', int.user)] })
                            });
                            subscription.add(track);
                        }

                        return int.editReply({ embeds: [new MusicEmbed(int).setItem(search).setEnqueued(subscription)] });
                    } else {
                        int.editReply({ embeds: [new ActionEmbed('fail', 'You have not provided a valid Spotify URL!', int.user)] });

                        return subscription.destroy();
                    }
                } catch (err) {
                    client.logger?.error(err);
                    int.editReply({ embeds: [new ActionEmbed('fail', 'You have not provided a valid Spotify URL!', int.user)] });

                    return subscription.destroy();
                }
            } else if (query.startsWith('https://www.youtube.com/playlist' || 'https://youtube.com/playlist')) {
                try {
                    const search = await play.playlist_info(query, { incomplete: true });

                    if (search instanceof play.YouTubePlayList) {
                        for (const video of search.videos) {
                            const track = new YouTubeTrack(subscription, int, video, {
                                onStart: () => int.channel.send({ embeds: [new MusicEmbed(int).setPlaying(subscription).setQueue(subscription)] }),
                                onError: () => int.channel.send({ embeds: [new ActionEmbed('fail', 'An error occured while playing a track!', int.user)] })
                            });
                            subscription.add(track);
                        }

                        return int.editReply({ embeds: [new MusicEmbed(int).setItem(search).setEnqueued(subscription)] });
                    } else {
                        int.editReply({ embeds: [new ActionEmbed('fail', 'Couldn\'t find your search result. Try again!', int.user)] });

                        return subscription.destroy();
                    }
                } catch {
                    client.logger?.error(err);
                    int.editReply({ embeds: [new ActionEmbed('fail', 'Couldn\'t find your search result. Try again!', int.user)] });

                    return subscription.destroy();
                }
            } else {
                try {
                    const search = await play.search(query, { limit: 1, source: { youtube: 'video' } });

                    if (search[0] instanceof play.YouTubeVideo) {
                        const track = new YouTubeTrack(subscription, int, search[0], {
                            onStart: () => { int.channel.send({ embeds: [new MusicEmbed(int).setPlaying(subscription).setQueue(subscription)] }); },
                            onError: () => int.channel.send({ embeds: [new ActionEmbed('fail', 'An error occured while playing a track!', int.user)] })
                        });
                        subscription.add(track);

                        return int.editReply({ embeds: [new MusicEmbed(int).setItem(track).setEnqueued(subscription)] });
                    } else {
                        int.editReply({ embeds: [new ActionEmbed('fail', 'Couldn\'t find your search result. Try again!', int.user)] });

                        return subscription.destroy();
                    }
                } catch (err) {
                    client.logger?.error(err);
                    int.editReply({ embeds: [new ActionEmbed('fail', 'Couldn\'t find your search result. Try again!', int.user)] });

                    return subscription.destroy();
                }
            }
        } catch (err) {
            client.logger?.error(err);
            console.error('Music Commands (ERROR) >> play: Error Running Command'.red);
            console.error(err);

            return int.editReply({ embeds: [new ActionEmbed('fail', 'An error occured. A developer has been notified!', int.user)] });
        }
    }
};