const Discord = require('discord.js');

class MusicEmbed extends Discord.MessageEmbed {
    constructor(client, message, type, track) {
        super();

        this.client = client;
        this.guild = message.guild;
        this.author = message.author;
        this.type = type;
        this.track = track;

        this.setColor('#C167ED');
        this.setFooter({ text: `${this.guild.name} | 🎵 CAT Music System`, iconURL: this.guild.iconURL({ dynamic: true }) });
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
                this.setAuthor({ name: `Requested By: ${this.track.author.tag}`, iconURL: this.track.author.avatarURL({ dynamic: true }) });
                this.setTitle(`Queue Updated`);
                this.setDescription(`Added: [${this.track.title} [${this.track.duration}]](${this.track.url})`);
                break;
            case 'playing':
                this.setAuthor({ name: `Requested By: ${this.track.author.tag}`, iconURL: this.track.author.avatarURL({ dynamic: true }) });
                this.setTitle(`Now Playing`);
                this.setDescription(`[${this.track.title} [${this.track.duration}]](${this.track.url})`);
                break;
            case 'paused':
                this.setAuthor({ name: this.author.tag, iconURL: this.author.avatarURL({ dynamic: true }) });
                this.setTitle(`Now Paused`);
                this.setDescription(`[${this.track.title} [${this.track.duration}]](${this.track.url})`);
                break;
            case 'queue':
                this.setAuthor({ name: this.author.tag, iconURL: this.author.avatarURL({ dynamic: true }) });
                this.setTitle(`Server Queue`);
                break;
            case 'skipped':
                this.setAuthor({ name: `Requested By: ${this.track.author.tag}`, iconURL: this.track.author.avatarURL({ dynamic: true }) });
                this.setTitle(`Track Skipped`);
                this.setDescription(`[${this.track.title} [${this.track.duration}]](${this.track.url})`);
                break;
            case 'unpaused':
                this.setAuthor({ name: `Requested By: ${this.track.author.tag}`, iconURL: this.track.author.avatarURL({ dynamic: true }) });
                this.setTitle(`Track Unpaused`);
                this.setDescription(`[${this.track.title} [${this.track.duration}]](${this.track.url})`);
                break;
            case 'paused':
                this.setAuthor({ name: `Requested By: ${this.track.author.tag}`, iconURL: this.track.author.avatarURL({ dynamic: true }) });
                this.setTitle(`Track Paused`);
                this.setDescription(`[${this.track.title} [${this.track.duration}]](${this.track.url})`);
                break;
            default:
                this.setAuthor({ name: this.author.tag, iconURL: this.author.avatarURL({ dynamic: true }) });
        }
    }

    setTrack(track) {
        return this.track = track;
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