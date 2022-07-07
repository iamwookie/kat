const DiscordVoice = require('@discordjs/voice');
const Commander = require('@commander/commander');

class MusicSubscription {
  constructor(client, channel, interaction) {
    this.client = client;
    this.interaction = interaction;
    this.channel = channel;
    this.guild = channel.guild;

    this.queue = this.client.player.createQueue(this.guild, {
      metadata: {
        channel: this.channel
      }
    });
  }

  static create(client, channel, interaction) {
    try {
      let sub = new MusicSubscription(client, channel, interaction);
      client.subscriptions.set(channel.guild.id, sub);
      console.log(`\nMusic >> Subscription Created: ${sub.guild.name} (${sub.guild.id})`.brightGreen);

      return sub;
    } catch (err) {
      Commander.handleError(client, err, false, channel.guild);
      console.error('Music (ERROR) >> Error Creating Subscription');
      console.error(err);
    }
  }

  async connect() {
    try {
      await this.queue.connect(this.channel);

      this.queue.connection.connectionTimeout = 5000;
      this.queue.connection.voiceConnection.on('stateChange', (_, newState) => { if (newState.status == DiscordVoice.VoiceConnectionStatus.Destroyed) this.destroy(); });

      console.log('Music (VOICE) >> Connection Ready'.brightGreen);
    } catch (err) {
      this.destroy();
      Commander.handleError(this.client, err, false, this.guild);
      console.error('Music (ERROR) >> Error Connecting to Voice Channel');
      console.error(err);
    }
  }

  destroy() {
    if (!this.queue.destroyed) this.queue.destroy();
    this.client.subscriptions.delete(this.guild.id);
    console.log(`Music >> Subscription Destroyed: ${this.guild.name} (${this.guild.id})`.yellow);
  }

  pause() {
    return this.queue.setPaused(true);
  }

  unpause() {
    return this.queue.setPaused(false);
  }

  // PROPERTIES

  active() {
    return this.queue.nowPlaying();
  }

  // BOOLEANS

  isPlaying() {
    return (this.queue.connection.status == DiscordVoice.AudioPlayerStatus.Playing);
  }

  isPaused() {
    return (this.queue.connection.paused);
  }
}

module.exports = MusicSubscription;