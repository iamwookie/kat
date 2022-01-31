const Discord = require('discord.js');
const play = require('play-dl');

class MusicEmbed extends Discord.MessageEmbed {
    constructor(client, message, type, data) {
        super();

        this.client = client;
        this.guild = message.guild;
        this.author = message instanceof Discord.CommandInteraction? message.user : message.author;
        this.type = type;
        this.data = data;

        this.setColor('#C167ED');
        this.setFooter({ text: `${this.guild.name} | 🎵 ${this.client.user.username} Global Music System`, iconURL: this.guild.iconURL({ dynamic: true }) });
        this.setType(this.type);
    }

    setType(type) {
        // EMOJIS
        let loading = '<a:loading:928668691997012028>'
        
        switch(type) {
            case 'searching':
                this.setAuthor({ name: this.author.tag, iconURL: this.author.avatarURL({ dynamic: true }) });
                this.setTitle(`${loading} \u200b Searching...`);
                break;
            case 'searching-spotify':
                this.setAuthor({ name: this.author.tag, iconURL: this.author.avatarURL({ dynamic: true }) });
                this.setTitle(`${loading} \u200b Searching Spotify...`);
                break;
            case 'enqueued':
                this.setAuthor({ name: `Requested By: ${this.author.tag}`, iconURL: this.author.avatarURL({ dynamic: true }) });

                if (this.data.type && (this.data.type == 'playlist' || this.data.type == 'album')) {
                    this.setTitle(`Queue Updated [${this.data.type == 'album' ? 'Album' : 'Playlist'}]`);
                    this.setDescription(`Added: [${this.data instanceof play.SpotifyPlaylist || this.data instanceof play.SpotifyAlbum? this.data.name : this.data.title}](${this.data.url})`);
                } else {
                    this.setTitle(`Queue Updated`);
                    this.setDescription(`Added: [${this.data.title} [${this.data.duration}]](${this.data.url})`);
                }
                
                break;
            case 'playing':
                this.setAuthor({ name: `Requested By: ${this.data.author.tag}`, iconURL: this.data.author.avatarURL({ dynamic: true }) });
                this.setTitle(`Now Playing`);
                this.setDescription(`[${this.data.title} [${this.data.duration}]](${this.data.url})`);
                break;
            case 'paused':
                this.setAuthor({ name: this.author.tag, iconURL: this.author.avatarURL({ dynamic: true }) });
                this.setTitle(`Now Paused`);
                this.setDescription(`[${this.data.title} [${this.data.duration}]](${this.data.url})`);
                break;
            case 'queue':
                this.setAuthor({ name: this.author.tag, iconURL: this.author.avatarURL({ dynamic: true }) });
                this.setTitle(`Server Queue`);
                break;
            case 'skipped':
                this.setAuthor({ name: `Requested By: ${this.data.author.tag}`, iconURL: this.data.author.avatarURL({ dynamic: true }) });
                this.setTitle(`Track Skipped`);
                this.setDescription(`[${this.data.title} [${this.data.duration}]](${this.data.url})`);
                break;
            case 'unpaused':
                this.setAuthor({ name: `Requested By: ${this.data.author.tag}`, iconURL: this.data.author.avatarURL({ dynamic: true }) });
                this.setTitle(`Track Unpaused`);
                this.setDescription(`[${this.data.title} [${this.data.duration}]](${this.data.url})`);
                break;
            case 'paused':
                this.setAuthor({ name: `Requested By: ${this.data.author.tag}`, iconURL: this.data.author.avatarURL({ dynamic: true }) });
                this.setTitle(`Track Paused`);
                this.setDescription(`[${this.data.title} [${this.data.duration}]](${this.data.url})`);
                break;
            case 'lyrics':
                this.setAuthor({ name: `Requested By: ${this.author.tag}`, iconURL: this.author.avatarURL({ dynamic: true }) });
                this.setTitle(`Lryics`);
                break;
            default:
                this.setAuthor({ name: this.author.tag, iconURL: this.author.avatarURL({ dynamic: true }) });
        }
    }

    setTrack(track) {
        return this.data = track;
    }
}

module.exports = {
    successEmbed(reply, author) {
        let embed = new Discord.MessageEmbed();

        if (author) embed.setAuthor({ name: author.tag, iconURL: author.avatarURL({ dynamic: true }) });
        embed.setColor('GREEN')
        embed.setDescription(`✅ \u200b ${reply}`);
        
        return embed;
    },

    failEmbed(reply, author) {
        let embed = new Discord.MessageEmbed();

        if (author) embed.setAuthor({ name: author.tag, iconURL: author.avatarURL({ dynamic: true }) });
        embed.setColor('RED')
        embed.setDescription(`🚫 \u200b ${reply}`);

        return embed;
    },

    loadEmbed(reply, author) {
        let loading = '<a:loading:928668691997012028>'
        let embed = new Discord.MessageEmbed()

        if (author) embed.setAuthor({ name: author.tag, iconURL: author.avatarURL({ dynamic: true }) });
        embed.setColor('YELLOW')
        embed.setDescription(`${loading} \u200b ${reply}`);

        return embed;
    },

    MusicEmbed
}