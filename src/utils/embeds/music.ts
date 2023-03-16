import { EmbedBuilder, Client, Guild, User, ChatInputCommandInteraction } from 'discord.js';

import { YouTubePlayList, SpotifyPlaylist, SpotifyAlbum } from 'play-dl';
import { MusicSubscription, YouTubeTrack, SpotifyTrack } from '@src/lib/music/index.js';
import { getServiceIcon, createProgressBar } from '../helpers.js';

export class MusicEmbed extends EmbedBuilder {
    private client: Client;
    private guild: Guild | null;
    private author: User;
    private item?: YouTubeTrack | SpotifyTrack | YouTubePlayList | SpotifyPlaylist | SpotifyAlbum;
    
    constructor(interaction: ChatInputCommandInteraction) {
        super();

        this.client = interaction.client;
        this.guild = interaction.guild;
        this.author = interaction.user;

        this.setColor('#C167ED');
        this.setFooter({ text: `${this.guild?.name} | 🎵 ${this.client.user?.username} Global Music System`, iconURL: this.guild?.iconURL()! });
    }

    setItem(item: YouTubeTrack | SpotifyTrack | YouTubePlayList | SpotifyPlaylist | SpotifyAlbum) {
        this.item = item;

        this.setAuthor({ name: "requestedBy" in this.item ? `Requested By: ${this.item.requestedBy.tag}` : this.author.tag, iconURL: this.author.avatarURL() ?? undefined });
        if (this.item?.thumbnail) this.setThumbnail(this.item?.thumbnail.url);

        return this;
    }

    setEnqueued(subscription: MusicSubscription) {
        if (!this.item) return this;

        if (this.item?.type == 'playlist' || this.item?.type == 'album') {
            this.item = this.item as YouTubePlayList | SpotifyPlaylist | SpotifyAlbum;

            const name = (this.item as YouTubePlayList).title ?? (this.item as SpotifyPlaylist | SpotifyAlbum).name;
            const trackCount = (this.item as YouTubePlayList).videoCount ?? (this.item as SpotifyPlaylist | SpotifyAlbum).tracksCount;

            this.addFields({ name: 'Enqueued:', value: `\`${trackCount}\` tracks from ${getServiceIcon(this.item)} [\`${name}\`](${this.item.url})` });
        } else {
            this.item = this.item as YouTubeTrack | SpotifyTrack;
            console.log(getServiceIcon(this.item))
            this.addFields({ name: 'Enqueued:', value: `\`${subscription?.queue.length == 0 ? 1 : subscription?.queue.length}.\` - ${getServiceIcon(this.item)} [\`${this.item?.title} [${this.item?.duration}]\`](${this.item?.url})` });
        }

        return this;
    }

    setPlaying(subscription: MusicSubscription) {
        if (subscription.active) {
            const track = subscription.active;
            const progressBar = createProgressBar("playbackDuration" in subscription.player.state ? subscription.player.state.playbackDuration : 0, track.durationRaw)

            this.addFields({ name: 'Now Playing:', value: `${getServiceIcon(track)} [\`${track.title} [${track.duration}]\`](${track.url})\n${progressBar}` });
            this.setItem(track);
        }

        return this;
    }

    setPaused(subscription: MusicSubscription) {
        if (subscription.active) {
            const track = subscription.active;
            const progressBar = createProgressBar("playbackDuration" in subscription.player.state ? subscription.player.state.playbackDuration : 0, track.durationRaw)

            this.addFields({ name: 'Paused Track:', value: `${getServiceIcon(track)} [\`${track.title} [${track.duration}]\`](${track.url})\n${progressBar}` });
            this.setItem(track);
        }

        return this;
    }

    setResumed(subscription: MusicSubscription) {
        if (subscription.active) {
            const track = subscription.active;
            const progressBar = createProgressBar("playbackDuration" in subscription.player.state ? subscription.player.state.playbackDuration : 0, track.durationRaw)

            this.addFields({ name: 'Resumed Track:', value: `${getServiceIcon(track)} [\`${track.title} [${track.duration}]\`](${track.url})\n${progressBar}` });
            this.setItem(track);
        }   

        return this;
    }

    setSkipped(subscription: MusicSubscription) {
        if (subscription.active) {
            const track = subscription.active;

            this.addFields({ name: 'Skipped Track:', value: `${getServiceIcon(track)} [\`${track.title} [${track.duration}]\`](${track.url})` });
            this.setItem(track);
        }

        return this;
    }

    setQueue(subscription: MusicSubscription) {
        if (subscription.queue.length) {
            try {
                let res = '';

                for (const [index, track] of subscription.queue.entries()) {
                    if (res.length >= 840) return this.addFields({ name: 'Server Queue:', value: `${res}...` });
                    res += `\`${index + 1}.\` - ${getServiceIcon(track)} [\`${track.title} [${track.duration}]\`](${track.url})\n`;
                }

                this.addFields({ name: 'Server Queue:', value: `${res}` });
            } catch (err) {
                this.client.logger?.error(err);
            }
        }

        return this;
    }
}