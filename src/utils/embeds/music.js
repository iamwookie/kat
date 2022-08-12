const { EmbedBuilder } = require('discord.js');
const { SpotifyTrack, SpotifyPlaylist, SpotifyAlbum } = require('play-dl');
const parseDuration = require('@utils/functions/parseDuration');

class MusicEmbed extends EmbedBuilder {
    constructor(client, int, type, info) {
        super();

        this.client = client;
        this.guild = int.guild;
        this.author = int.user;
        this.type = type;
        this.info = info;

        if (this.info) {
            if (this.info.spotify) this.info.url = this.info.spotify.url;
            this.thumbnail = this.info.thumbnail?.url || this.info.thumbnails[0]?.url;
        }

        if (this.thumbnail) this.setThumbnail(this.thumbnail);

        this.setColor('#C167ED');
        this.setFooter({ text: `${this.guild.name} | 🎵 ${this.client.user.username} Global Music System`, iconURL: this.guild.iconURL({ dynamic: true }) });
        this.setType(this.type);
    }

    setType(type) {
        // EMOJIS
        let loading = '<a:loading:928668691997012028>';

        switch (type) {
            case 'searching':
                this.setAuthor({ name: this.author.tag, iconURL: this.author.avatarURL({ dynamic: true }) });
                this.setTitle(`${loading} \u200b Searching...`);
                break;
            case 'enqueued':
                this.setAuthor({ name: `Requested By: ${this.author.tag}`, iconURL: this.author.avatarURL({ dynamic: true }) });

                if (this.info.type == 'playlist' || this.info.type == 'album') {
                    if (this.info instanceof SpotifyPlaylist || this.info instanceof SpotifyAlbum) {
                        this.info.title = this.info.name;
                        this.info.videoCount = this.info.tracksCount;
                    }

                    this.setTitle(`Queue Updated [Playlist]`);
                    this.setDescription(`Added \`${this.info.videoCount}\` Tracks From: [${this.info.title}](${this.info.url})`);
                } else {
                    if (this.info instanceof SpotifyTrack) {
                        this.info.title = `${this.info.artists[0].name} - ${this.info.name}`;
                        this.info.durationRaw = parseDuration(this.info.durationInSec);
                    }

                    this.setTitle(`Queue Updated`);
                    this.setDescription(`Added: [${this.info.title} [${this.info.durationRaw}]](${this.info.url})`);
                }

                break;
            case 'playing':
                this.setAuthor({ name: `Requested By: ${this.info.requestedBy.tag}`, iconURL: this.info.requestedBy.avatarURL({ dynamic: true }) });
                this.setTitle(`Now Playing`);
                this.setDescription(`[${this.info.title} [${this.info.duration}]](${this.info.url})`);
                break;
            case 'paused':
                this.setAuthor({ name: this.author.tag, iconURL: this.author.avatarURL({ dynamic: true }) });
                this.setTitle(`Track Paused`);
                this.setDescription(`[${this.info.title} [${this.info.duration}]](${this.info.url})`);
                break;
            case 'queue':
                this.setAuthor({ name: this.author.tag, iconURL: this.author.avatarURL({ dynamic: true }) });
                this.setTitle(`Server Queue`);
                break;
            case 'skipped':
                this.setAuthor({ name: `Requested By: ${this.info.requestedBy.tag}`, iconURL: this.info.requestedBy.avatarURL({ dynamic: true }) });
                this.setTitle(`Track Skipped`);
                this.setDescription(`[${this.info.title} [${this.info.duration}]](${this.info.url})`);
                break;
            case 'resumed':
                this.setAuthor({ name: this.author.tag, iconURL: this.author.avatarURL({ dynamic: true }) });
                this.setTitle(`Track Resumed`);
                this.setDescription(`[${this.info.title} [${this.info.duration}]](${this.info.url})`);
                break;
            case 'lyrics':
                this.setAuthor({ name: `Requested By: ${this.author.tag}`, iconURL: this.author.avatarURL({ dynamic: true }) });
                this.setTitle(`Lryics`);
                break;
            default:
                this.setAuthor({ name: this.author.tag, iconURL: this.author.avatarURL({ dynamic: true }) });
        }
    }
}

module.exports = MusicEmbed;