const Discord = require('discord.js');
const { SpotifyTrack, SpotifyPlaylist, SpotifyAlbum } = require('play-dl');

class MusicEmbed extends Discord.EmbedBuilder {
  constructor(client, int, type, info) {
    super();

    this.client = client;
    this.guild = int.guild;
    this.author = int.user;
    this.type = type;
    this.info = info;

    if (this.info && this.info.spotify) this.info.url = this.info.spotify.url;

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

class TwitchEmbed extends Discord.EmbedBuilder {
  constructor(user, stream, image) {
    super();

    this.setColor('#9146ff');
    this.setAuthor({ name: `${stream.userDisplayName} is NOW LIVE!!`, iconURL: user.profilePictureUrl, URL: `https://www.twitch.tv/${user.name}` });
    this.setTitle(`${stream.title}`);
    this.setTitle(stream.title);
    this.setURL(`https://www.twitch.tv/${user.name}`);
    this.addFields([
      { name: 'Playing', value: stream.gameName, inline: true },
      { name: 'Viewers', value: stream.viewers.toString(), inline: true },
      { name: '-----------------------------------------------------------', value: `[Click here to watch now!](https://www.twitch.tv/${user.name})` }
    ]);
    this.setImage(image);
  }
}

function parseDuration(time) {
  let hours = Math.floor(time / 3600);
  let minutes = Math.floor(time / 60);
  let seconds = time - minutes * 60;
  return `${hours > 0 ? hours + ':' : ''}${minutes > 0 ? minutes + ':' : ''}${seconds}`;
};

module.exports = {
  successEmbed(reply, author) {
    let embed = new Discord.EmbedBuilder();

    if (author) embed.setAuthor({ name: author.tag, iconURL: author.avatarURL({ dynamic: true }) });
    embed.setColor('Green');
    embed.setDescription(`✅ \u200b ${reply}`);

    return embed;
  },

  failEmbed(reply, author) {
    let embed = new Discord.EmbedBuilder();

    if (author) embed.setAuthor({ name: author.tag, iconURL: author.avatarURL({ dynamic: true }) });
    embed.setColor('Red');
    embed.setDescription(`🚫 \u200b ${reply}`);

    return embed;
  },

  loadEmbed(reply, author) {
    let loading = '<a:loading:928668691997012028>';
    let embed = new Discord.EmbedBuilder();

    if (author) embed.setAuthor({ name: author.tag, iconURL: author.avatarURL({ dynamic: true }) });
    embed.setColor('Yellow');
    embed.setDescription(`${loading} \u200b ${reply}`);

    return embed;
  },

  MusicEmbed,
  TwitchEmbed
};