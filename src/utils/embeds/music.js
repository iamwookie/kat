const { EmbedBuilder } = require('discord.js');
const { SpotifyPlaylist, SpotifyAlbum } = require('play-dl');
const { YouTubeTrack, SpotifyTrack } = require('@lib/music/tracks');
const progressbar = require('string-progressbar');

class MusicEmbed extends EmbedBuilder {
    constructor(interaction, item) {
        super();

        this.client = interaction.client;
        this.guild = interaction.guild;
        this.author = item.requestedBy || interaction.user;
        this.item = item;
        this.type = type;

        this.icons = {
            youtube: '<:youtube:928668691997012028>',
            spotify: '<:spotify:928668691997012028>'
        }

        if (this.item.thumbnail) this.setThumbnail(this.item.thumbnail.url);

        this.setColor('#C167ED');
        this.setAuthor({ name: `${this.item.requestedBy && 'Requested by: '} ${this.author.tag}`, iconURL: this.author.avatarURL({ dynamic: true }) });      
        this.setFooter({ text: `${this.guild.name} | 🎵 ${this.client.user.username} Global Music System`, iconURL: this.guild.iconURL({ dynamic: true }) });
    }

    setType(type) {
        switch (type) {
            case 'enqueued':
                if (this.item.type == 'playlist' || this.item.type == 'album') {
                    if (this.item instanceof SpotifyPlaylist || this.item instanceof SpotifyAlbum) {
                        this.item.title = this.item.name;
                        this.item.videoCount = this.item.tracksCount;
                    }

                    this.setDescription(`Enqueued \`${this.item.videoCount}\` tracks from: \`[${this.item.title}](${this.item.url})\``);
                } else {
                    if (this.item instanceof SpotifyTrack) {
                        this.item.title = `${this.item.artists[0].name} - ${this.item.name}`;
                        this.item.durationRaw = parseDuration(this.item.durationInSec);
                    }

                    this.setDescription(`Enqueued: \`[${this.item.title} [${this.item.durationRaw}]](${this.item.url})\``);
                }

                break;
            case 'playing':
                this.setDescription(`Now playing: [${this.item.title} [${this.item.duration}]](${this.item.url})`);
                break;
            case 'paused':
                this.setTitle(`Track Paused`);
                this.setDescription(`[${this.item.title} [${this.item.duration}]](${this.item.url})`);
                break;
            case 'queue':
                this.setTitle(`Server Queue`);
                this.createQueue(this.subscription.queue);
                break;
            case 'skipped':
                this.setDescription(`Track Skipped: \`[${this.item.title} [${this.item.duration}]](${this.item.url})\``);
                break;
            case 'resumed':
                this.setDescription(`Track Resumed: \`[${this.item.title} [${this.item.duration}]](${this.item.url})\``);
                break;
        }
    }

    createQueue(subscription) {
        let res = '';

        if (subscription.active) {
            const track = subscription.active;
            const playbackDuration = Math.round((subscription.player.state.playbackDuration) / 1000);
            res += `Now Playing: \`${track.title} [${track.duration}](${track.url})\`\n`;
            res += `${progressbar.splitBar(track.durationRaw, playbackDuration, 30)[0]}\n\n`;
        }

        if (subscription.queue.length) {
            subscription.queue.map((track, index) => {
                res += `${index + 1}. \`${track instanceof YouTubeTrack && this.icons.youtube} ${track instanceof SpotifyTrack && this.icons.spotify} ${track.title} [${track.duration}](${track.url})\`\n`;
            });
        }

        return res;
    }
}

module.exports = MusicEmbed;