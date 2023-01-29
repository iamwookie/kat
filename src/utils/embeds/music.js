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
            purple: '<:purple:1068554599331537036>'
        };

        this.setColor('#C167ED');
        this.setFooter({ text: `${this.guild.name} | 🎵 ${this.client.user.username} Global Music System`, iconURL: this.guild.iconURL({ dynamic: true }) });
    }

    #addIcon(item) { return `${item instanceof YouTubeTrack || item instanceof YouTubePlayList ? this.icons.youtube : ''} ${item instanceof SpotifyTrack || item instanceof SpotifyPlaylist || item instanceof SpotifyAlbum ? this.icons.spotify : ''}`; }

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

            this.addFields({ name: 'Enqueued:', value: `\`${this.item?.videoCount}\` tracks from ${this.#addIcon(this.item)} [\`${this.item?.title}\`](${this.item?.url})` });
        } else {
            this.addFields({ name: 'Enqueued:', value: `\`${subscription?.queue.length}\`. - ${this.#addIcon(this.item)} [\`${this.item?.title} [${this.item?.duration}]\`](${this.item?.url})` });
        }

        return this;
    }

    setPlaying(subscription) {
        if (subscription.active) {
            const track = subscription.active;
            const playbackDuration = Math.round((subscription.player.state.playbackDuration) / 1000);
            this.addFields({ name: 'Now Playing:', value: `${this.#addIcon(track)} [\`${track.title} [${track.duration}]\`](${track.url})\n${progressbar.splitBar(track.durationRaw, playbackDuration, 26, '▬', this.icons.purple)[0]}` });
            this.setItem(track);
        }

        return this;
    }

    setPaused(subscription) {
        if (subscription.active) {
            const track = subscription.active;
            const playbackDuration = Math.round((subscription.player.state.playbackDuration) / 1000);
            this.addFields({ name: 'Paused Track:', value: `${this.#addIcon(track)} [\`${track.title} [${track.duration}]\`](${track.url})\n${progressbar.splitBar(track.durationRaw, playbackDuration, 26, '▬', this.icons.purple)[0]}` });
            this.setItem(track);
        }

        return this;
    }

    setResumed(subscription) {
        if (subscription.active) {
            const track = subscription.active;
            const playbackDuration = Math.round((subscription.player.state.playbackDuration) / 1000);
            this.addFields({ name: 'Resumed Track:', value: `${this.#addIcon(track)} [\`${track.title} [${track.duration}]\`](${track.url})\n${progressbar.splitBar(track.durationRaw, playbackDuration, 26, '▬', this.icons.purple)[0]}` });
            this.setItem(track);
        }

        return this;
    }

    setSkipped(subscription) {
        if (subscription.active) {
            const track = subscription.active;
            this.addFields({ name: 'Skipped Track:', value: `${this.#addIcon(track)} [\`${track.title} [${track.duration}]\`](${track.url})` });
            this.setItem(track);
        }

        return this;
    }

    setQueue(subscription) {
        if (subscription.queue.length) {
            try {
                var res = '';

                for (const [index, track] of subscription.queue.entries()) {
                    if (res.length >= 840) return this.addFields({ name: 'Server Queue:', value: `${res}...` });
                    res += `\`${index + 1}.\` - ${this.#addIcon(track)} [\`${track.title} [${track.duration}]\`](${track.url})\n`;
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