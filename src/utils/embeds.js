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
        this.setFooter(`${this.guild.name} | 🎵 CAT Music System`, this.guild.iconURL({ dynamic: true }));
        this.setType(this.type);
    }

    setType(type) {
        switch(type) {
            case 'searching':
                let loading = '<a:loading:928668691997012028>'
                this.setAuthor(`${this.author.tag}`, this.author.avatarURL({ dynamic: true }));
                this.setTitle(`${loading} \u200b Searching...`);
                break;
            case 'enqueued':
                this.setAuthor(`Requested By: ${this.track.author.tag}`, this.track.author.avatarURL({ dynamic: true }));
                this.setTitle(`Queue Updated`);
                this.setDescription(`Added: [${this.track.title} [${this.track.duration}]](${this.track.url})`);
                break;
            case 'playing':
                this.setAuthor(`Requested By: ${this.track.author.tag}`, this.track.author.avatarURL({ dynamic: true }));
                this.setTitle(`Now Playing`);
                this.setDescription(`[${this.track.title} [${this.track.duration}]](${this.track.url})`);
                break;
            case 'paused':
                this.setAuthor(`${this.author.tag}`, this.author.avatarURL({ dynamic: true }));
                this.setTitle(`Now Paused`);
                this.setDescription(`[${this.track.title} [${this.track.duration}]](${this.track.url})`);
                break;
            case 'queue':
                this.setAuthor(`${this.author.tag}`, this.author.avatarURL({ dynamic: true }));
                this.setTitle(`Server Queue`);
                break;
            case 'skipped':
                this.setAuthor(`Requested By: ${this.track.author.tag}`, this.track.author.avatarURL({ dynamic: true }));
                this.setTitle(`Track Skipped`);
                this.setDescription(`[${this.track.title} [${this.track.duration}]](${this.track.url})`);
                break;
            case 'unpaused':
                this.setAuthor(`Requested By: ${this.track.author.tag}`, this.track.author.avatarURL({ dynamic: true }));
                this.setTitle(`Track Unpaused`);
                this.setDescription(`[${this.track.title} [${this.track.duration}]](${this.track.url})`);
                break;
            case 'paused':
                this.setAuthor(`Requested By: ${this.track.author.tag}`, this.track.author.avatarURL({ dynamic: true }));
                this.setTitle(`Track Paused`);
                this.setDescription(`[${this.track.title} [${this.track.duration}]](${this.track.url})`);
                break;
            default:
                this.setAuthor(`${this.author.tag}`, this.author.avatarURL({ dynamic: true }));
        }
    }

    setTrack(track) {
        return this.track = track;
    }
}

module.exports = {
    successEmbed(reply, author) {
        let embed = new Discord.MessageEmbed()
        if (author) embed.setAuthor(author.tag, author.avatarURL({ dynamic: true }));
        embed.setColor('GREEN')
        embed.setDescription(`✅ \u200b ${reply}`);
        return embed;
    },

    failEmbed(reply, author) {
        let embed = new Discord.MessageEmbed()
        if (author) embed.setAuthor(author.tag, author.avatarURL({ dynamic: true }));
        embed.setColor('RED')
        embed.setDescription(`🚫 \u200b ${reply}`);
        return embed;
    },

    MusicEmbed
}