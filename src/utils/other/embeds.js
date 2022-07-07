const Discord = require('discord.js');

class MusicEmbed extends Discord.MessageEmbed {
  constructor(client, int, type, data) {
    super();

    this.client = client;
    this.guild = int.guild;
    this.author = int.user;
    this.type = type;
    this.data = data;

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

        if (this.data.playlist) {
          this.setTitle(`Queue Updated [Playlist]`);
          this.setDescription(`Added: [${this.data.playlist.title}](${this.data.playlist.url})`);
        } else {
          this.setTitle(`Queue Updated`);
          this.setDescription(`Added: [${this.data.title} [${this.data.duration}]](${this.data.url})`);
        }

        break;
      case 'playing':
        this.setAuthor({ name: `Requested By: ${this.data.requestedBy.tag}`, iconURL: this.data.requestedBy.avatarURL({ dynamic: true }) });
        this.setTitle(`Now Playing`);
        this.setDescription(`[${this.data.title} [${this.data.duration}]](${this.data.url})`);
        break;
      case 'paused':
        this.setAuthor({ name: this.author.tag, iconURL: this.author.avatarURL({ dynamic: true }) });
        this.setTitle(`Track Paused`);
        this.setDescription(`[${this.data.title} [${this.data.duration}]](${this.data.url})`);
        break;
      case 'queue':
        this.setAuthor({ name: this.author.tag, iconURL: this.author.avatarURL({ dynamic: true }) });
        this.setTitle(`Server Queue`);
        break;
      case 'skipped':
        this.setAuthor({ name: `Requested By: ${this.data.requestedBy.tag}`, iconURL: this.data.requestedBy.avatarURL({ dynamic: true }) });
        this.setTitle(`Track Skipped`);
        this.setDescription(`[${this.data.title} [${this.data.duration}]](${this.data.url})`);
        break;
      case 'resumed':
        this.setAuthor({ name: `Requested By: ${this.data.requestedBy.tag}`, iconURL: this.data.requestedBy.avatarURL({ dynamic: true }) });
        this.setTitle(`Track Resumed`);
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
}

module.exports = {
  successEmbed(reply, author) {
    let embed = new Discord.MessageEmbed();

    if (author) embed.setAuthor({ name: author.tag, iconURL: author.avatarURL({ dynamic: true }) });
    embed.setColor('GREEN');
    embed.setDescription(`✅ \u200b ${reply}`);

    return embed;
  },

  failEmbed(reply, author) {
    let embed = new Discord.MessageEmbed();

    if (author) embed.setAuthor({ name: author.tag, iconURL: author.avatarURL({ dynamic: true }) });
    embed.setColor('RED');
    embed.setDescription(`🚫 \u200b ${reply}`);

    return embed;
  },

  loadEmbed(reply, author) {
    let loading = '<a:loading:928668691997012028>';
    let embed = new Discord.MessageEmbed();

    if (author) embed.setAuthor({ name: author.tag, iconURL: author.avatarURL({ dynamic: true }) });
    embed.setColor('YELLOW');
    embed.setDescription(`${loading} \u200b ${reply}`);

    return embed;
  },

  MusicEmbed
};