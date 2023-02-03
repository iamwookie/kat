const { EmbedBuilder } = require('discord.js');
const { SpotifyPlaylist, SpotifyAlbum, YouTubePlayList } = require('play-dl');
const { YouTubeTrack, SpotifyTrack } = require('@lib/music/tracks');
const progressbar = require('string-progressbar');

class MusicEmbed extends EmbedBuilder {
    constructor(interaction) {
        super();

        this.client = interaction.client;
        this.guild = interaction.guild;
        this.author = interaction.user;

        this.icons = {
            youtube: '<:youtube:1067881972774477844>',
            spotify: '<:spotify:1067881968697614476>',
            slider: '<:purple:1068554599331537036>'
        };

        this.setColor('#C167ED');
        this.setFooter({ text: `${this.guild.name} | 🎵 ${this.client.user.username} Global Music System`, iconURL: this.guild.iconURL({ dynamic: true }) });
    }

    #getServiceIcon(item) {
        if (item instanceof YouTubeTrack || item instanceof YouTubePlayList) {
            return this.icons.youtube;
        } else if (item instanceof SpotifyTrack || item instanceof SpotifyPlaylist || item instanceof SpotifyAlbum) {
            return this.icons.spotify;
        } else {
            return '';
        }
    }

    setItem(item) {
        this.item = item;

        this.setAuthor({ name: `${this.item?.requestedBy ? 'Requested By: ' : ''}${this.author.tag}`, iconURL: this.author.avatarURL({ dynamic: true }) });
        if (this.item?.thumbnail) this.setThumbnail(this.item?.thumbnail.url);

        return this;
    }

    setEnqueued(subscription) {
        if (!this.item) return this;

        if (this.item?.type == 'playlist' || this.item?.type == 'album') {
            if (this.item instanceof SpotifyPlaylist || this.item instanceof SpotifyAlbum) {
                this.item.title = this.item?.name;
                this.item.videoCount = this.item?.tracksCount;
            }

            this.addFields({ name: 'Enqueued:', value: `\`${this.item?.videoCount}\` tracks from ${this.#getServiceIcon(this.item)} [\`${this.item?.title}\`](${this.item?.url})` });
        } else {
            this.addFields({ name: 'Enqueued:', value: `\`${subscription?.queue.length}.\` - ${this.#getServiceIcon(this.item)} [\`${this.item?.title} [${this.item?.duration}]\`](${this.item?.url})` });
        }

        return this;
    }

    setPlaying(subscription) {
        if (subscription.active) {
            const track = subscription.active;
            const playbackDuration = Math.round((subscription.player.state.playbackDuration) / 1000);
            let progressBar = progressbar.splitBar(track.durationRaw, playbackDuration, 26, '▬', this.icons.slider)[0];
            if (playbackDuration == 0) progressBar = this.icons.slider + progressBar.slice(1);

            this.addFields({ name: 'Now Playing:', value: `${this.#getServiceIcon(track)} [\`${track.title} [${track.duration}]\`](${track.url})\n${progressBar}` });
            this.setItem(track);
        }

        return this;
    }

    setPaused(subscription) {
        if (subscription.active) {
            const track = subscription.active;
            const playbackDuration = Math.round((subscription.player.state.playbackDuration) / 1000);
            let progressBar = progressbar.splitBar(track.durationRaw, playbackDuration, 26, '▬', this.icons.slider)[0];
            if (playbackDuration == 0) progressBar = this.icons.slider + progressBar.slice(1);

            this.addFields({ name: 'Paused Track:', value: `${this.#getServiceIcon(track)} [\`${track.title} [${track.duration}]\`](${track.url})\n${progressBar}` });
            this.setItem(track);
        }

        return this;
    }

    setResumed(subscription) {
        if (subscription.active) {
            const track = subscription.active;
            const playbackDuration = Math.round((subscription.player.state.playbackDuration) / 1000);
            let progressBar = progressbar.splitBar(track.durationRaw, playbackDuration, 26, '▬', this.icons.slider)[0];
            if (playbackDuration == 0) progressBar = this.icons.slider + progressBar.slice(1);

            this.addFields({ name: 'Resumed Track:', value: `${this.#getServiceIcon(track)} [\`${track.title} [${track.duration}]\`](${track.url})\n${progressBar}` });
            this.setItem(track);
        }

        return this;
    }

    setSkipped(subscription) {
        if (subscription.active) {
            const track = subscription.active;

            this.addFields({ name: 'Skipped Track:', value: `${this.#getServiceIcon(track)} [\`${track.title} [${track.duration}]\`](${track.url})` });
            this.setItem(track);
        }

        return this;
    }

    setQueue(subscription) {
        if (subscription.queue.length) {
            try {
                let res = '';

                for (const [index, track] of subscription.queue.entries()) {
                    if (res.length >= 840) return this.addFields({ name: 'Server Queue:', value: `${res}...` });
                    res += `\`${index + 1}.\` - ${this.#getServiceIcon(track)} [\`${track.title} [${track.duration}]\`](${track.url})\n`;
                }

                this.addFields({ name: 'Server Queue:', value: `${res}` });
            } catch (err) {
                this.client.logger?.error(err);
            }
        }

        return this;
    }
}

module.exports = MusicEmbed;